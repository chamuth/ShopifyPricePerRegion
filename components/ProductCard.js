class ProductCard extends React.Component {
  render() {
    return (
      <div className="product card">
        <div className="top">
          <img src={this.props.image} alt="" />
          <span className="product-title">{this.props.title}</span>

          <a className="delete-button waves-effect waves-light btn-small green" target="_blank" href={this.props.productUrl}>
            <i className="material-icons prefix">link</i> Open Product
          </a>
          <a className="delete-button waves-effect waves-light btn-small red">
            <i className="material-icons prefix">delete</i> Delete Product
          </a>
        </div>

        <div className="product-content">
          <table className="table">
            <thead>
              <tr>
                <th>Variant</th>
                <th></th>
                <th>United States Dollar (USD)</th>
                <th>United Kingdom Pounds (GBP)</th>
                <th>Canadian Dollar (CAD)</th>
              </tr>
            </thead>

            <tbody>
              {this.props.variants.edges.map((edge) => (
                <tr>
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
                    <input type="number" step=".01" placeholder="GBP 0.00" />
                    <input type="number" step=".01" placeholder="GBP 0.00" className="strikethrough" />
                  </td>
                  <td>
                    <input type="number" step=".01" placeholder="CAD 0.00" />
                    <input type="number" step=".01" placeholder="CAD 0.00" className="strikethrough" />
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default ProductCard;