import React, { Component } from 'react'
import cookie from 'react-cookie'

const DETAILS = 'details'
const CREATE = 'create'

class Assets extends Component {

    constructor(props) {
        super(props)
        this.state = {
            page_content: DETAILS,
            asset:{

            }
        }
    }

    showCreateAssetPage() {
        this.setState({...this.state, page_content:CREATE})
    }

    setSearch(e) {
        let enter_key_pressed = (e.key === 'Enter')
        if (e.key && !enter_key_pressed)
            return;
    }

    cloneAsset(e) {
        let searched_asset = this.refs.search.value
        console.log("searched asset>> "+searched_asset)
    }

    setAssetName(e) {
        let name = e.target.value
        let a = this.state.asset
        a.name = name
        this.setState({...this.state, asset:a})
    }

    setAssetDescription(e) {
        let description = e.target.value
        let a = this.state.asset
        a.description = description
        this.setState({...this.state, asset:a})
    }


    showSearch() {
      let asset = this.state.asset
      let glassimg = `${app_base}/images/magglass2.png`
      return (
          <div className="search-asset">
            <input
              type="search"
              placeholder="find asset to clone"
              ref="search"
              className="search-input"
              style={{background:"transparent url("+glassimg+") no-repeat scroll left center"}}
              onKeyPress={this.setSearch.bind(this)}
              onBlur={this.setSearch.bind(this)}
            />
            <button onClick={this.cloneAsset.bind(this)}>Clone</button>
          </div>
      )
    }

    showAssetDetails() {
        return (
            <div className="asset-detail">
                <div style={{display:"inline-block", width:"45%"}}>
                <input
                    type="text"
                    placeholder="Name"
                    className="username"
                    defaultValue={this.state.asset.name}
                    onBlur={this.setAssetName.bind(this)}
                />
                <textarea
                    rows="2"
                    cols="40"
                    placeholder="Description"
                    className="username"
                    defaultValue={this.state.asset.description}
                    onBlur={this.setAssetDescription.bind(this)}
                />
                </div>
                <div style={{display:"inline-block", width:"45%", verticalAlign:"top"}}>
                    <div>
                        <h2 className="asset-header">Channels</h2>
                        <button>Add</button>
                    </div>
                    <div>
                        <h2 className="asset-header">Properties</h2>
                        <button>Add</button>
                    </div>
                </div>
            </div>
        )
    }

    render() {
      let s = this.state
      return (
          <div className="section_form">
              <div className="metadata-page">
                  {(s.page_content == DETAILS) &&
                      <div>
                          <h2>Assets</h2>
                          <p>
                              Assets are collectors of time series or log data, typically representing a device.
                              They may have channels, properties, and be labelled for grouping and for data aggregation.
                          </p>
                          <button onClick={this.showCreateAssetPage.bind(this)}>Create</button>
                      </div>
                  }
                  {(s.page_content == CREATE) &&
                      <div>
                          <form>
                              <h2 className="search-asset-header">New Asset</h2>
                              {this.showSearch()}
                              {this.showAssetDetails()}
                              <button>Create</button>
                          </form>
                      </div>
                  }
              </div>
          </div>
      )
    }
}

export default Assets
