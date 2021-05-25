import { useState, useRef } from "react"
import gql from "graphql-tag"
import { useMutation } from "@apollo/react-hooks"

const ProductCard = (props) => {
  const UPDATE_PRODUCT = gql`
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          metafields(first: 4) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `
  const [updateProduct, { loading, error }] = useMutation(UPDATE_PRODUCT)
  const [updating, setUpdating] = useState(false)

  const getCurrencyForVariant = (node) => {
    for (var i = 0; i < node.selectedOptions.length; i++) {
      if (node.selectedOptions[i].name === "pprCurrency") {
        return node.selectedOptions[i].value
      }
    }
    return null
  }

  const limitLength = (str) => {
    if (str.length > 50) return str.substr(0, 50) + "..."
    else return str
  }

  const preprocessVariants = () => {
    var returner = {}

    // props.variants.edges.map((edge) => {
    //   if (!returner[edge.node.sku]) returner[edge.node.sku] = {}

    //   if (getCurrencyForVariant(edge.node))
    //     returner[edge.node.sku][getCurrencyForVariant(edge.node)] = {
    //       price: edge.node.price,
    //       compareAtPrice: edge.node.compareAtPrice,
    //     }
    //   else
    //     returner[edge.node.sku]["EUR"] = {
    //       price: edge.node.price,
    //       compareAtPrice: edge.node.compareAtPrice,
    //     }

    //   returner[edge.node.sku]["data"] = edge.node
    // })

    props.variants.edges.map((edge) => {
      returner[
        getCurrencyForVariant(edge.node)
          ? getCurrencyForVariant(edge.node)
          : "EUR"
      ] = {
        SKU: edge.node.sku,
        price: edge.node.price,
        compareAtPrice: edge.node.compareAtPrice,
      }

      returner["data"] = edge.node
    })
    // returns {EUR, USD, GBP, data} object

    return returner
  }

  const processVariantOptions = (options) => {
    var ret = []
    options.forEach((option) => {
      if (!["USD", "GBP", "EUR"].includes(option["value"]))
        ret.push(option["value"])
    })
    return ret
  }

  const saveProduct = (e) => {
    // process input prices
    var variants = []

    // foreach variant SKUs - NO sku split now
    const inventory = preprocessedVariants["data"]["inventoryQuantity"]

    const originalOptions = processVariantOptions(
      preprocessedVariants["data"]["selectedOptions"]
    )

    const USD_price = formatPrice(
      prices["USD_price"].current.value / props.rates.EURUSD
    )
    const USD_compareAtPrice = formatPrice(
      prices["USD_compareAtPrice"].current.value / props.rates.EURUSD
    )

    const EUR_price = formatPrice(prices["EUR_price"].current.value / 1)
    const EUR_compareAtPrice = formatPrice(
      prices["EUR_compareAtPrice"].current.value / 1
    )

    const GBP_price = formatPrice(
      prices["GBP_price"].current.value / props.rates.EURGBP
    )
    const GBP_compareAtPrice = formatPrice(
      prices["GBP_compareAtPrice"].current.value / props.rates.EURGBP
    )

    const mainSKU = preprocessedVariants["EUR"]["SKU"]

    const USDVariant = {
      sku: preprocessedVariants["USD"]
        ? preprocessedVariants["USD"]["SKU"]
        : mainSKU + "-US",
      price: USD_price.toString(),
      compareAtPrice:
        USD_compareAtPrice != null ? USD_compareAtPrice.toString() : null,
      options: ["USD"].concat(originalOptions),
      inventoryQuantities: {
        availableQuantity: inventory,
        locationId: props.locationId,
      },
    }

    const EURVariant = {
      sku: mainSKU.endsWith("-EU") ? mainSKU : mainSKU + "-EU",
      price: EUR_price.toString(),
      compareAtPrice:
        EUR_compareAtPrice != null ? EUR_compareAtPrice.toString() : null,
      options: ["EUR"].concat(originalOptions),
      inventoryQuantities: {
        availableQuantity: inventory,
        locationId: props.locationId,
      },
    }

    const GBPVariant = {
      sku: preprocessedVariants["GBP"]
        ? preprocessedVariants["GBP"]["SKU"]
        : mainSKU + "-GB",
      price: GBP_price.toString(),
      compareAtPrice:
        GBP_compareAtPrice != null ? GBP_compareAtPrice.toString() : null,
      options: ["GBP"].concat(originalOptions),
      inventoryQuantities: {
        availableQuantity: inventory,
        locationId: props.locationId,
      },
    }

    variants.push(EURVariant)
    if (USD_price != "" && USD_price != null && USD_price !== "0.00")
      variants.push(USDVariant)
    if (GBP_price != "" && GBP_price != null && GBP_price !== "0.00")
      variants.push(GBPVariant)

    var optionsWithoutPPR = props.node.options.filter(
      (x) => x["name"] != "pprCurrency"
    )
    var originalProductOptions = ["pprCurrency"]
    originalProductOptions = originalProductOptions.concat(
      optionsWithoutPPR.map((option) => option["name"])
    )

    var metafields = [
      {
        id: preprocessedMetafields["USD"].id,
        namespace: "ppr",
        key: "availability_USD",
        value: availability["USD"].current.checked === true ? "true" : "false",
        valueType: "STRING",
      },
      {
        id: preprocessedMetafields["EUR"].id,
        namespace: "ppr",
        key: "availability_EUR",
        value: availability["EUR"].current.checked === true ? "true" : "false",
        valueType: "STRING",
      },
      {
        id: preprocessedMetafields["GBP"].id,
        namespace: "ppr",
        key: "availability_GBP",
        value: availability["GBP"].current.checked === true ? "true" : "false",
        valueType: "STRING",
      },
    ]

    // Set variants for given product id
    var input = {
      id: props.id,
      options: ["pprCurrency", "pprTitle"],
      variants: variants,
      metafields: metafields,
    }
    console.log(JSON.stringify(input))
    updateProduct({ variables: { input: input } }).then((er) => {
      console.log(JSON.stringify(er))
      props.refetch()
    })

    setUpdating(true)

    e.preventDefault()
  }

  const formatPrice = (num) => {
    if (num !== "" && num !== null) {
      var x = parseFloat(num)
      return (Math.round(x * 100) / 100).toFixed(2)
    } else {
      return null
    }
  }

  const processMetafields = () => {
    var returner = {
      USD: {
        id: null,
        value: "true",
      },
      EUR: {
        id: null,
        value: "true",
      },
      GBP: {
        id: null,
        value: "true",
      },
    }

    props.metafields.edges.map((edge) => {
      if (edge.node.namespace === "ppr") {
        if (edge.node.key === "availability_USD") {
          returner["USD"].id = edge.node.id
          returner["USD"].value = edge.node.value
        }

        if (edge.node.key === "availability_EUR") {
          returner["EUR"].id = edge.node.id
          returner["EUR"].value = edge.node.value
        }

        if (edge.node.key === "availability_GBP") {
          returner["GBP"].id = edge.node.id
          returner["GBP"].value = edge.node.value
        }
      }
    })

    return returner
  }

  const preprocessedVariants = preprocessVariants()
  const preprocessedMetafields = processMetafields()

  let prices = {
    USD_price: useRef(null),
    USD_compareAtPrice: useRef(null),
    EUR_price: useRef(null),
    EUR_compareAtPrice: useRef(null),
    GBP_price: useRef(null),
    GBP_compareAtPrice: useRef(null),
  }

  let availability = {
    USD: useRef(null),
    EUR: useRef(null),
    GBP: useRef(null),
  }

  const variant = preprocessedVariants
  const variantComplete = variant.USD && variant.EUR && variant.GBP

  return (
    <div className="product card">
      <div className="top">
        <img src={props.image} alt="" />
        <span className="product-title">{props.title}</span>

        <div class="toolbox">
          {loading && updating && (
            <strong class="green-text">Saving Product...</strong>
          )}
          {!loading && !error && updating && (
            <strong class="green-text">Product Saved</strong>
          )}
          {error && <p>{JSON.stringify(error)}</p>}

          <a
            onClick={saveProduct}
            className="delete-button waves-effect waves-light btn-small green"
            href="#"
          >
            <i className="material-icons prefix">save</i> Save Product
          </a>
          <a className="delete-button waves-effect waves-light btn-small red">
            <i className="material-icons prefix">delete</i> Delete Product
          </a>
        </div>
      </div>

      <div className="product-availability">
        <span style={{ marginRight: 25 }}>Product Availability</span>
        <p>
          <label>
            <input
              ref={availability["USD"]}
              defaultChecked={preprocessedMetafields["USD"].value === "true"}
              name="available_usd"
              type="checkbox"
            />
            <span>Global (USD)</span>
          </label>
        </p>

        <p>
          <label>
            <input
              ref={availability["EUR"]}
              defaultChecked={preprocessedMetafields["EUR"].value === "true"}
              name="available_eur"
              type="checkbox"
            />
            <span>Europe (EUR)</span>
          </label>
        </p>

        <p>
          <label>
            <input
              ref={availability["GBP"]}
              defaultChecked={preprocessedMetafields["GBP"].value === "true"}
              name="available_gbp"
              type="checkbox"
            />
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
              <th>Europe (Default) (EUR)</th>
              <th>Global (USD)</th>
              <th>United Kingdom (GBP)</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <strong>{limitLength(variant.data.displayName)}</strong>
                <span className="gray"></span>
              </td>
              <td>
                <span>Price</span>
                <span>Compare Price</span>
              </td>

              <td>
                <input
                  type="number"
                  step=".01"
                  ref={prices["EUR_price"]}
                  placeholder="EUR 0.00"
                  defaultValue={
                    variant.EUR ? formatPrice(variant.EUR.price * 1) : ""
                  }
                />
                <input
                  type="number"
                  step=".01"
                  ref={prices["EUR_compareAtPrice"]}
                  placeholder="EUR 0.00"
                  className="strikethrough"
                  defaultValue={
                    variant.EUR
                      ? formatPrice(variant.EUR.compareAtPrice * 1)
                      : ""
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  step=".01"
                  ref={prices["USD_price"]}
                  placeholder="USD 0.00"
                  defaultValue={
                    variant.USD
                      ? formatPrice(variant.USD.price * props.rates.EURUSD)
                      : ""
                  }
                />
                <input
                  type="number"
                  step=".01"
                  ref={prices["USD_compareAtPrice"]}
                  placeholder="USD 0.00"
                  className="strikethrough"
                  defaultValue={
                    variant.USD
                      ? formatPrice(
                          variant.USD.compareAtPrice * props.rates.EURUSD
                        )
                      : ""
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  step=".01"
                  ref={prices["GBP_price"]}
                  placeholder="GBP 0.00"
                  defaultValue={
                    variant.GBP
                      ? formatPrice(variant.GBP.price * props.rates.EURGBP)
                      : ""
                  }
                />
                <input
                  type="number"
                  step=".01"
                  ref={prices["GBP_compareAtPrice"]}
                  placeholder="GBP 0.00"
                  className="strikethrough"
                  defaultValue={
                    variant.GBP
                      ? formatPrice(
                          variant.GBP.compareAtPrice * props.rates.EURGBP
                        )
                      : ""
                  }
                />
              </td>

              <td class="text-center">
                <span
                  class={
                    "material-icons " +
                    (variantComplete ? "green-text" : "gray-text")
                  }
                >
                  check_circle
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductCard
