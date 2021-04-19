import { useState, useRef } from "react";
import gql from 'graphql-tag';
import { useMutation } from "@apollo/react-hooks";

const ProductCard = (props) => 
{
  const UPDATE_PRODUCT = gql`
  mutation UpdateProductVariants($variants: [ProductVariantBulkInput!]!, $productId: ID!)
  {
    productVariantsBulkCreate(variants: $variants, productId: $productId) {
      product {
        id
      }
      productVariants {
        id
      }
      userErrors {
        code
        field
        message
      }
    }
  }
  `;
  const [updateProduct, {loading,error}] = useMutation(UPDATE_PRODUCT);
  const [updating, setUpdating] = useState(false);

  const preprocessVariants = () => 
  {
    var returner = {};

    props.variants.edges.map((edge) => {
      if (!returner[edge.node.sku])
        returner[edge.node.sku] = {};

      if (edge.node.pprCurrency)
        returner[edge.node.sku][edge.node.pprCurrency.value] = {
          price: edge.node.price,
          compareAtPrice: edge.node.compareAtPrice
        };
      else 
        returner[edge.node.sku]["USD"] = {
          price: edge.node.price,
          compareAtPrice: edge.node.compareAtPrice
        };
      
      returner[edge.node.sku]["data"] = edge.node;
    })

    return returner;
  }

  const saveProduct = (e) => {
    // process input prices
    var variants = [];

    Object.keys(prices).forEach((SKU) => {
      // foreach variant SKUs
      const originalVariantId = preprocessedVariants[SKU].data.id;

      const USD_price = (prices[SKU]["USD_price"]).current.value
      const USD_compareAtPrice = (prices[SKU]["USD_compareAtPrice"]).current.value
      const EUR_price = (prices[SKU]["EUR_price"]).current.value / props.rates.USDEUR;
      const EUR_compareAtPrice = (prices[SKU]["EUR_compareAtPrice"]).current.value / props.rates.USDEUR;
      const GBP_price = (prices[SKU]["GBP_price"]).current.value / props.rates.USDGBP;
      const GBP_compareAtPrice = (prices[SKU]["GBP_compareAtPrice"]).current.value / props.rates.USDGBP;

      const originalVariant = {
        id: originalVariantId,
        sku: SKU,
        price: USD_price,
        compareAtPrice: (USD_compareAtPrice != "") ? USD_compareAtPrice : null,
        metafields: [{ namespace: "ppr", key: "pprCurrency", value: "USD" }]
      }

      const EURVariant = {
        id: originalVariantId + 1,
        sku:  SKU,
        price: EUR_price,
        compareAtPrice: (EUR_compareAtPrice != "") ? EUR_compareAtPrice : null,
        metafields: [{ namespace: "ppr", key: "pprCurrency", value: "EUR" }]
      }

      const GBPVariant = {
        id: originalVariantId + 2,
        sku: SKU,
        price: GBP_price,
        compareAtPrice: (GBP_compareAtPrice != "") ? GBP_compareAtPrice : null,
        metafields: [{ namespace: "ppr", key: "pprCurrency", value: "GBP" }]
      }

      variants.push(originalVariant)
      if (EUR_price != "")
        variants.push(EURVariant)
      if (GBP_price != "")
        variants.push(GBPVariant)
    })

    alert(JSON.stringify(variants));

    // Set variants for given product id
    updateProduct({ variables: 

      { 
        variants : variants,
        productId : props.id
      } 

    }).then(() => {
      props.refetch();
    });

    setUpdating(true);

    e.preventDefault();
  }
  
  const preprocessedVariants = preprocessVariants();

  let prices = {};
  
  return (
    <div className="product card">
      <div className="top">
        <img src={props.image} alt="" />
        <span className="product-title">{props.title}</span>

        <div class="toolbox">
          {loading && updating && <strong class="green-text">Saving Product...</strong>}
          {!loading && !error && updating && <strong class="green-text">Product Saved</strong>}
          
          <a onClick={saveProduct} className="delete-button waves-effect waves-light btn-small green" href="#">
            <i className="material-icons prefix">save</i> Save Product
          </a>
          <a className="delete-button waves-effect waves-light btn-small red">
            <i className="material-icons prefix">delete</i> Delete Product
          </a>
        </div>
      </div>

      <div className="product-content">
        <table className="table">
          <thead>
            <tr>
              <th>Variant</th>
              <th></th>
              <th>Global (USD)</th>
              <th>Europe (EUR)</th>
              <th>United Kingdom (GBP)</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(preprocessedVariants).map((SKU) => {
              const variant = preprocessedVariants[SKU];
              const variantComplete = (variant.USD && variant.EUR && variant.GBP);

              prices[SKU] = {};
              
              prices[SKU]["USD_price"] = useRef(null);
              prices[SKU]["USD_compareAtPrice"] = useRef(null);
              prices[SKU]["EUR_price"] = useRef(null);
              prices[SKU]["EUR_compareAtPrice"] = useRef(null);
              prices[SKU]["GBP_price"] = useRef(null);
              prices[SKU]["GBP_compareAtPrice"] = useRef(null);

              return (
                <tr>
                  <td>
                    <strong>{variant.data.displayName}</strong>
                    <span className="gray"><strong>SKU: </strong> {SKU}</span>
                  </td>
                  <td>
                    <span>Price</span>
                    <span>Compare Price</span>
                  </td>
                  <td>
                  <input 
                      type="number" 
                      step=".01" 
                      ref={prices[SKU]["USD_price"]}
                      placeholder="USD 0.00" 
                      defaultValue={variant.USD ? variant.USD.price : ""}
                    />
                    <input 
                      type="number"
                      step=".01"
                      ref={prices[SKU]["USD_compareAtPrice"]}
                      placeholder="USD 0.00"
                      className="strikethrough" 
                      defaultValue={variant.USD ? variant.USD.compareAtPrice : ""} 
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      step=".01" 
                      ref={prices[SKU]["EUR_price"]}
                      placeholder="EUR 0.00" 
                      defaultValue={variant.EUR ? (variant.EUR.price * props.rates.USDEUR) : ""}
                    />
                    <input 
                      type="number"
                      step=".01"
                      ref={prices[SKU]["EUR_compareAtPrice"]}
                      placeholder="EUR 0.00"
                      className="strikethrough" 
                      defaultValue={variant.EUR ? (variant.EUR.compareAtPrice * props.rates.USDEUR) : ""} 
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      step=".01" 
                      ref={prices[SKU]["GBP_price"]}
                      placeholder="GBP 0.00" 
                      defaultValue={variant.GBP ? (variant.GBP.price * props.rates.USDGBP) : ""}
                    />
                    <input 
                      type="number"
                      step=".01"
                      ref={prices[SKU]["GBP_compareAtPrice"]}
                      placeholder="GBP 0.00"
                      className="strikethrough" 
                      defaultValue={variant.GBP ? (variant.GBP.compareAtPrice * props.rates.USDGBP) : ""} 
                    />
                  </td>
                  <td class="text-center">
                    <span class={"material-icons " + (variantComplete ? "green-text" : "gray-text")}>
                      check_circle
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductCard;