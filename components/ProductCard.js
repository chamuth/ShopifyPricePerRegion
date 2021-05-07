import { useState, useRef } from "react";
import gql from 'graphql-tag';
import { useMutation } from "@apollo/react-hooks";
import { NoUnusedFragmentsRule } from "graphql";

const ProductCard = (props) => 
{
  const UPDATE_PRODUCT = gql`
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
  }  
  `;
  const [updateProduct, {loading,error}] = useMutation(UPDATE_PRODUCT);
  const [updating, setUpdating] = useState(false);

  const getCurrencyForVariant = (node)  =>
  {
    for(var i = 0; i < node.selectedOptions.length; i++)
    {
      if (node.selectedOptions[i].name === "pprCurrency")
      {
        return node.selectedOptions[i].value;
      }
    }
    return null;
  }

  const limitLength = (str) => {
    if (str.length > 50)
      return str.substr(0, 50) + "...";
    else return str;
  }

  const preprocessVariants = () => 
  {
    var returner = {};

    props.variants.edges.map((edge) => {
      if (!returner[edge.node.sku])
        returner[edge.node.sku] = {};

      if (getCurrencyForVariant(edge.node))
        returner[edge.node.sku][getCurrencyForVariant(edge.node)] = {
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

  const processVariantOptions = (options) =>
  {
    var ret = [];
    options.forEach((option) => {
      if (!["USD", "GBP", "EUR"].includes(option["value"]))
        ret.push(option["value"])
    });
    return ret;
  }

  const saveProduct = (e) => {
    // process input prices
    var variants = [];

    Object.keys(prices).forEach((SKU) => {
      // foreach variant SKUs
      const inventory = preprocessedVariants[SKU]["data"]["inventoryQuantity"];

      const originalOptions = processVariantOptions(preprocessedVariants[SKU]["data"]["selectedOptions"]);

      const USD_price = formatPrice((prices[SKU]["USD_price"]).current.value)
      const USD_compareAtPrice = formatPrice((prices[SKU]["USD_compareAtPrice"]).current.value)
      const EUR_price = formatPrice((prices[SKU]["EUR_price"]).current.value / props.rates.USDEUR);
      const EUR_compareAtPrice = formatPrice((prices[SKU]["EUR_compareAtPrice"]).current.value / props.rates.USDEUR);
      const GBP_price = formatPrice((prices[SKU]["GBP_price"]).current.value / props.rates.USDGBP);
      const GBP_compareAtPrice = formatPrice((prices[SKU]["GBP_compareAtPrice"]).current.value / props.rates.USDGBP);

      const originalVariant = {
        sku: SKU,
        price: USD_price.toString(),
        compareAtPrice: (USD_compareAtPrice != null) ? USD_compareAtPrice.toString() : null,
        options: ["USD"].concat(originalOptions),
        inventoryQuantities: {availableQuantity: inventory, locationId: props.locationId}
      }

      const EURVariant = {
        sku:  SKU,
        price: EUR_price.toString(),
        compareAtPrice: (EUR_compareAtPrice != null) ? EUR_compareAtPrice.toString() : null,
        options: ["EUR"].concat(originalOptions),
        inventoryQuantities: {availableQuantity: inventory, locationId: props.locationId}
      }

      const GBPVariant = {
        sku: SKU,
        price: GBP_price.toString(),
        compareAtPrice: (GBP_compareAtPrice != null) ? GBP_compareAtPrice.toString() : null,
        options: ["GBP"].concat(originalOptions),
        inventoryQuantities: {availableQuantity: inventory, locationId: props.locationId}
      }


      variants.push(originalVariant)
      if (EUR_price != "" && EUR_price != null && EUR_price !== "0.00")
        variants.push(EURVariant)
      if (GBP_price != "" && GBP_price != null && GBP_price !== "0.00")
        variants.push(GBPVariant)
    })

    var optionsWithoutPPR = props.node.options.filter((x) => x["name"] != "pprCurrency")
    var originalProductOptions = [
      "pprCurrency"
    ]; 
    originalProductOptions = originalProductOptions.concat(optionsWithoutPPR.map((option) => option["name"]));

    // Set variants for given product id
    var input = { 
      id : props.id,
      options: ["pprCurrency", "pprTitle"],
      variants: variants,
    }
    console.log(JSON.stringify(input));
    updateProduct({ variables: { input : input } })
      .then((er) => {
        console.log(JSON.stringify(er));
        props.refetch();
      });

    setUpdating(true);

    e.preventDefault();
  }

  const formatPrice = (num) => {
    if (num !== "" && num !== null)
    {
      var x = parseFloat(num);
      return (Math.round(x * 100) / 100).toFixed(2);
    } else {
      return null;
    }
  }
  
  const preprocessedVariants = preprocessVariants();

  let prices = {};
  let availability = {
    USD: useRef(null),
    EUR: useRef(null),
    GBP: useRef(null),
  };
  
  return (
    <div className="product card">
      <div className="top">
        <img src={props.image} alt="" />
        <span className="product-title">{props.title}</span>

        <div class="toolbox">
          {loading && updating && <strong class="green-text">Saving Product...</strong>}
          {!loading && !error && updating && <strong class="green-text">Product Saved</strong>}
          {error && (<p>{JSON.stringify(error)}</p>)}
          
          <a onClick={saveProduct} className="delete-button waves-effect waves-light btn-small green" href="#">
            <i className="material-icons prefix">save</i> Save Product
          </a>
          <a className="delete-button waves-effect waves-light btn-small red">
            <i className="material-icons prefix">delete</i> Delete Product
          </a>
        </div>
      </div>

      <div className="product-availability">
        <span style={{marginRight:25}}>Product Availability</span>
        <p>
          <label>
            <input ref={availability["USD"]} type="checkbox" checked="checked" />
            <span>Global (USD)</span>
          </label>
        </p>

        <p>
          <label>
            <input ref={availability["EUR"]} type="checkbox" checked="checked" />
            <span>Europe (EUR)</span>
          </label>
        </p>

        <p>
          <label>
            <input ref={availability["GBP"]} type="checkbox" checked="checked" />
            <span>United Kingdom (GBP)</span>
          </label>
        </p>

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
                    <strong>{limitLength(variant.data.displayName)}</strong>
                    <span className="gray"><strong>SKU: </strong> {limitLength(SKU)}</span>
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
                      defaultValue={variant.USD ? formatPrice(variant.USD.price) : ""}
                    />
                    <input 
                      type="number"
                      step=".01"
                      ref={prices[SKU]["USD_compareAtPrice"]}
                      placeholder="USD 0.00"
                      className="strikethrough" 
                      defaultValue={variant.USD ? formatPrice(variant.USD.compareAtPrice) : ""} 
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      step=".01" 
                      ref={prices[SKU]["EUR_price"]}
                      placeholder="EUR 0.00" 
                      defaultValue={variant.EUR ? formatPrice(variant.EUR.price * props.rates.USDEUR) : ""}
                    />
                    <input 
                      type="number"
                      step=".01"
                      ref={prices[SKU]["EUR_compareAtPrice"]}
                      placeholder="EUR 0.00"
                      className="strikethrough" 
                      defaultValue={variant.EUR ? formatPrice(variant.EUR.compareAtPrice * props.rates.USDEUR) : ""} 
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      step=".01" 
                      ref={prices[SKU]["GBP_price"]}
                      placeholder="GBP 0.00" 
                      defaultValue={variant.GBP ? formatPrice(variant.GBP.price * props.rates.USDGBP) : ""}
                    />
                    <input 
                      type="number"
                      step=".01"
                      ref={prices[SKU]["GBP_compareAtPrice"]}
                      placeholder="GBP 0.00"
                      className="strikethrough" 
                      defaultValue={variant.GBP ? formatPrice(variant.GBP.compareAtPrice * props.rates.USDGBP) : ""} 
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