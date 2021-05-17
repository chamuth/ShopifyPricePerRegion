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
          metafields(first: 5) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
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
    this.state = {
      q: "",
      query: "",
      tab: "products",
      rates: {},
      after: null,
      previousAfter: null,
      usdeurrate: React.createRef(),
      usdgbprate: React.createRef(),
      eurusdrate: React.createRef(),
      eurgbprate: React.createRef(),
      savingRates: false,
    };

    this.handleChange = this.handleChange.bind(this);

    setInterval(() => {
      this.setState({query: this.state.q});
    }, 1000)
  }

  handleChange(event) {
    this.setState({q: event.target.value});
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
          else if (x["key"] === "EURUSD")
            rates["EURUSD"] = x["value"]
          else if (x["key"] === "EURGBP")
            rates["EURGBP"] = x["value"]
        })

        this.setState({ rates: rates });
      });
  }

  submitRates = () =>
  {
    const requestOptions = {
      method: 'POST'
    };
    this.setState({
      savingRates: true
    })

    fetch(
      "/api/rates?EURUSD=" 
      + this.state.eurusdrate.current.value 
      + "&EURGBP=" 
      + this.state.eurgbprate.current.value,
    requestOptions)
      .then((_) => {
        this.setState({
          savingRates: false
        })
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
                  <input id="search_query" type="text" value={this.state.q} onChange={this.handleChange} />
                  <label htmlFor="icon_telephone">Search Products</label>
                </div>
              </form>

              {this.state.query !== "" && <p>Showing results for &quot;{this.state.query}&quot;</p>}

              <div className="products-list">
                <Query query={GET_PRODUCTS} variables={{ 
                  query: "title:" + this.state.query + " a",
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
                                metafields={edge.node.metafields}
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
                      <td>1 EUR in USD</td>
                      <td>
                        <input 
                          type="number" 
                          step="0.01" 
                          name="EURUSD"
                          ref={this.state.eurusdrate}
                          defaultValue={this.state.rates.EURUSD}
                        ></input>
                      </td>
                    </tr>
                    <tr>
                      <td>1 EUR in GBP</td>
                      <td>
                        <input 
                          type="number" 
                          step="0.01"
                          name="EURGBP"
                          ref={this.state.eurgbprate}
                          defaultValue={this.state.rates.EURGBP}
                        ></input>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button class="btn" onClick={this.submitRates} disabled={this.state.savingRates} style={{marginTop:25}}>Update Rates</button>
                {this.state.savingRates && <span class="green-text" style={{marginLeft:20}}>Saving Exchange Rates...</span>}
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Index;
