import ProductCard from "../components/ProductCard";
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_SHOP = gql`
  query GetShop {
    shop {
      id
      name
      myshopifyDomain
    }
  }
`
const GET_PRODUCTS = gql`
  query GetProducts($query: String!) {
    products (first: 5, query: $query) {
      edges {
        node {
          id
          title 
          description
          featuredImage {
            originalSrc
          }
          onlineStoreUrl
          variants (first : 5) {
            edges {
              node {
                id
                sku
                inventoryQuantity
                displayName
                price
                pprCurrency: metafield(namespace: "ppr", key: "pprCurrency") {
                  value
                }
                compareAtPrice
              }
            }
          }
        }
      }
    }
  }
`

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {query: ""};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({query: event.target.value});
  }

  render() {
    return (
      <div className="main">
        <div className="sidebar">

          <Query query={GET_SHOP}>
            {({data, loading, error}) => {
              return (
                <div className="store-details">
                  <span className="material-icons">
                    store
                  </span>
                  {loading && <span className="store-name">Please wait...</span>}
                  {!loading && !error && <span className="store-name">{data.shop.name}</span>}
                  {error && <p>Error {JSON.stringify(error)}</p>}
                  {!loading && !error && 
                    <a href={"http://" + data.shop.myshopifyDomain} target="_blank">
                      <span className="store-link waves-effect waves-dark">
                        <span className="material-icons">link</span>
                        Open Store
                      </span>
                    </a>
                  }
                </div>
              );
            }}
          </Query>

          <div className="menu">
            <div className="item waves-effect waves-light">
              <span className="material-icons">settings</span>
              <span className="caption">Installation</span>
            </div>
            <div className="item waves-effect waves-light">
              <span className="material-icons">language</span>
              <span className="caption">Countries</span>
            </div>
            <div className="item active waves-effect waves-light">
              <span className="material-icons">sell</span>
              <span className="caption">Products</span>
            </div>
          </div>
        </div>
        {/* <!-- 
      Here we load the products with presaved metafields (meaning ones we have already edited)
      Once the user saves a product with multiple currencies with this app it gets the metafields with multiple currencies,
      matching products will only render in the matching store using liquid rendering and stuff injected to the theme, the first time the application is installed
      through the shopify API
    --> */}
        <div className="content">
          <div className="container-fluid">
            <div className="card">

              <h4 className="title">Products</h4>

              <form action="" style={{marginTop:20}}>
                <div className="input-field col s6">
                  <i className="material-icons prefix">search</i>
                  <input id="search_query" type="text" value={this.state.query} onChange={this.handleChange} />
                  <label htmlFor="icon_telephone">Search Products</label>
                </div>
              </form>

              {this.state.query !== "" && <p>Showing results for &quot;{this.state.query}&quot;</p>}

              <div className="products-list">
                <Query query={GET_PRODUCTS} variables={{ query: "title:" + this.state.query }}>
                  {({data, loading, error}) => {
                    if (loading)
                      return <p>Loading products....</p>;
                    if (!loading && !error)
                      return data.products.edges.map((edge) => {
                        return (
                          <ProductCard 
                            id={edge.node.id}
                            title={edge.node.title}
                            image={edge.node.featuredImage.originalSrc}
                            productUrl={edge.node.onlineStoreUrl}
                            variants={edge.node.variants}
                          />
                        );
                      })
                    
                      return <p>Error {JSON.stringify(error)}</p>
                  }}
                </Query>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Index;
