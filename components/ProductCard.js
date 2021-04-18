class ProductCard extends React.Component {

  preprocessVariants() 
  {
    var returner = {};

    this.props.variants.edges.map((edge) => {
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

  
  render() {
    var preprocessedVariants = this.preprocessVariants();
    
    return (
      <div className="product card">
        <div className="top">
          <img src={this.props.image} alt="" />
          <span className="product-title">{this.props.title}</span>

          <div class="toolbox">
            <a className="delete-button waves-effect waves-light btn-small green" target="_blank" href={this.props.productUrl}>
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
              </tr>
            </thead>

            <tbody>
              {Object.keys(preprocessedVariants).map((SKU) => {
                var variant = preprocessedVariants[SKU];
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
                      <input type="number" step=".01" placeholder="USD 0.00" defaultValue={variant.USD.price}/>
                      <input type="number" step=".01" placeholder="USD 0.00" className="strikethrough" defaultValue={variant.USD.compareAtPrice} />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step=".01" 
                        placeholder="EUR 0.00" 
                        defaultValue={variant.EUR ? variant.EUR.price : ""}
                      />
                      <input 
                        type="number"
                        step=".01"
                        placeholder="EUR 0.00"
                        className="strikethrough" 
                        defaultValue={variant.EUR ? variant.EUR.compareAtPrice : ""} 
                      />
                    </td>
                    <td>
                    <input 
                        type="number" 
                        step=".01" 
                        placeholder="GBP 0.00" 
                        defaultValue={variant.GBP ? variant.GBP.price : ""}
                      />
                      <input 
                        type="number"
                        step=".01"
                        placeholder="GBP 0.00"
                        className="strikethrough" 
                        defaultValue={variant.GBP ? variant.GBP.compareAtPrice : ""} 
                      />
                    </td>
                  </tr>
                )
              })}

              {/* {this.props.variants.edges.map((edge) => (
                <tr>
                  {JSON.stringify(edge.privateMetafield)}
                  <td>
                    <strong>{edge.node.displayName}</strong>
                    <span className="gray"><strong>SKU: </strong> {edge.node.sku}</span>
                  </td>
                  <td>
                    <span>Price</span>
                    <span>Compare Price</span>
                  </td>
                  <td>
                    <input type="number" step=".01" placeholder="USD 0.00" defaultValue={edge.node.price}/>
                    <input type="number" step=".01" placeholder="USD 0.00" className="strikethrough" defaultValue={edge.node.compareAtPrice} />
                  </td>
                  <td>
                    <input type="number" step=".01" placeholder="EUR 0.00" />
                    <input type="number" step=".01" placeholder="EUR 0.00" className="strikethrough" />
                  </td>
                  <td>
                    <input type="number" step=".01" placeholder="EUR 0.00" />
                    <input type="number" step=".01" placeholder="EUR 0.00" className="strikethrough" />
                  </td>
                  <td>
                    <input type="number" step=".01" placeholder="GBP 0.00" />
                    <input type="number" step=".01" placeholder="GBP 0.00" className="strikethrough" />
                  </td>
                </tr>
              ))} */}
{/* 
              {Object.keys(proprocessedVariants).map((sku) => {
                var variants = preprocessedVariants[sku];
                return (
                  <tr>
                    <td>
                      <strong>{variants[0].node.displayName}</strong>
                      <span className="gray"><strong>SKU: </strong> {sku}</span>
                    </td>
                    <td>
                      <span>Price</span>
                      <span>Compare Price</span>
                    </td>
                    <td>
                      <input type="number" step=".01" placeholder="USD 0.00" defaultValue={edge.node.price}/>
                      <input type="number" step=".01" placeholder="USD 0.00" className="strikethrough" defaultValue={edge.node.compareAtPrice} />
                    </td>
                    <td>
                      <input type="number" step=".01" placeholder="EUR 0.00" />
                      <input type="number" step=".01" placeholder="EUR 0.00" className="strikethrough" />
                    </td>
                    <td>
                      <input type="number" step=".01" placeholder="EUR 0.00" />
                      <input type="number" step=".01" placeholder="EUR 0.00" className="strikethrough" />
                    </td>
                    <td>
                      <input type="number" step=".01" placeholder="GBP 0.00" />
                      <input type="number" step=".01" placeholder="GBP 0.00" className="strikethrough" />
                    </td>
                  </tr>
                )
              })} */}

            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default ProductCard;