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
  query GetProducts($query: String!, $pageSize: Int!) {
    products (first: $pageSize, query: $query) {
      edges {
        cursor
        node {
          id
          title 
          description
          featuredImage {
            originalSrc
          }
          onlineStoreUrl
          options { id, name, values}
          variants (first : 5) {
            edges {
              node {
                id
                sku
                inventoryQuantity
                displayName
                price
                selectedOptions
                {
                  name, value
                }
                compareAtPrice
              }
            }
          }
        }
      }
    }

    locations(first: 10) {
      edges {
        node {
          id
        }
      }
    }
  }
`

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {query: "", tab: "products", rates: {}, after: null, previousAfter: null};

    this.handleChange = this.handleChange.bind(this);

    this.usdeurrate = React.createRef();
    this.usdgbprate = React.createRef();
  }

  handleChange(event) {
    this.setState({query: event.target.value});
  }

  changeTab(tab)
  {
    this.setState({tab: tab})
  }

  componentDidMount(){
    this.refetchRates();
  }

  refetchRates()
  {
    fetch("/api/rates")
      .then(res => res.json())
      .then((result) => {
        var rates = {};

        result.forEach((x) => {
          if (x["key"] === "USDEUR")
            rates["USDEUR"] = x["value"]
          else if (x["key"] === "USDGBP")
            rates["USDGBP"] = x["value"]
        })

        this.setState({ rates: rates });
      });
  }

  submitRates()
  {
    alert(this.usdeurrate.current.value + " " + this.usdgbprate.current.value);
    const requestOptions = {
      method: 'POST'
    };
    fetch("/api/rates?USDEUR=" + this.usdeurrate.current.value + "&USDGBP=" + this.usdgbprate.current.value, requestOptions)
      .then(response => response.json())
      .then((_) => {
        this.refetchRates();
      });
  }

  pageCount()
  {
    return Math.ceil(count/10)
  }

  onPaginate(data)
  {
    this.setState({ offset: Math.ceil(data.selected * this.props.perPage) });
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
            <div 
              onClick={() => this.changeTab("rates")} 
              className={"item waves-effect waves-light " + (this.state.tab === "rates" ? "active" : "")}
            >
              <span className="material-icons">euro</span>
              <span className="caption">Exchange Rates</span>
            </div>
            <div 
              onClick={() => this.changeTab("products")} 
              className={"item waves-effect waves-light " + (this.state.tab === "products" ? "active" : "")}
            >
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
            {this.state.tab === "products" && (
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
                <Query query={GET_PRODUCTS} variables={{ 
                  query: "title:" + this.state.query + " ",
                  pageSize: 20
                }}>
                  {({data, loading, error, refetch}) => {
                    
                    if (loading)
                      return <p>Loading products....</p>;
                      
                    if (!loading && !error)
                    {
                      const lid = data.locations.edges[0].node.id;

                      return (
                        <>
                          {data.products.edges.map((edge) => {
                            return (
                              <ProductCard 
                                rates={this.state.rates}
                                refetch={refetch}
                                locationId={lid}
                                id={edge.node.id}
                                title={edge.node.title}
                                image={edge.node.featuredImage.originalSrc}
                                productUrl={edge.node.onlineStoreUrl}
                                variants={edge.node.variants}
                                node={edge.node}
                              />
                            );
                          })}
                        </>
                      );
                    }
                    
                    return <p>Error {JSON.stringify(error)}</p>
                  }}
                </Query>

              </div>

            </div>
            )}

            {this.state.tab === "rates" && 
              <div className="card">
                <h4 style={{marginBottom: 20}} className="title">Exchange Rates</h4>

                <table>
                  <thead>
                    <tr>
                      <th>Currency</th>
                      <th>Exchange Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1 USD in EUR</td>
                      <td>
                        <input 
                          type="number" 
                          step="0.01" 
                          name="USDEUR"
                          ref={this.usdeurrate}
                          defaultValue={this.state.rates.USDEUR}
                        ></input>
                      </td>
                    </tr>
                    <tr>
                      <td>1 USD in GBP</td>
                      <td>
                        <input 
                          type="number" 
                          step="0.01"
                          name="USDGBP"
                          ref={this.usdgbprate}
                          defaultValue={this.state.rates.USDGBP}
                        ></input>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button class="btn" onClick={this.submitRates} style={{marginTop:25}}>Update Rates</button>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Index;
