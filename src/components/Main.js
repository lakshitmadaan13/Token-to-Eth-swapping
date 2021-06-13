import React, { Component } from 'react'
import Swap from '../abi/Swap.json'
import IUniswapV2Router02 from '../abi/IUniswapV2Router02.json'
import Web3 from 'web3'
import Header from './Header'
import ERC20 from '../abi/ERC20.json'

class Main extends Component {

    constructor(props) {
      super(props)
      this.state = {
        Tokenamount:'',
        account: '',
        balance: '',
        swapping: null,
        erc20:null,
        unsiswap: null,
        loading: false,
        targetToken:"",
        tokenBlock: [{
          isApprove: false,
          tokenAddress: "",
          tokenAmount: ""
        }]
      }
    }

    async componentWillMount() {
      //detect metamask
      const metamaskInstalled = typeof window.web3 !== 'undefined'
      this.setState({ metamaskInstalled })
      if (metamaskInstalled) {
        await this.loadWeb3()
        await this.loadBlockchainData()
      }
    }
    async loadWeb3() {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
        }
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
          window.alert("Please Install Metamask...")
        }
    }
    
    async loadBlockchainData() {
        const web3 = window.web3
    
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })
        console.log(this.state.account)

        const balances = await web3.eth.getBalance(this.state.account)
        this.setState({balance: balances})
    
        const networkId = await web3.eth.net.getId()
        console.log(networkId)
    
        if (networkId === 3) {
        const swap = new web3.eth.Contract(Swap, "0x7Fe04682004A227604543F1d7daDaF9971833792")
        this.setState({ swapping: swap })
    
        const uniswap = new web3.eth.Contract(IUniswapV2Router02, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
        this.setState({ uniswap: uniswap })
        
        console.log(this.state.swapping,this.state.uniswap, this.state.account)
        } else {
          alert("Smart contract not deployed to this network..")
        }
  }

  async onApprove(i) {
    const web3 = window.web3
    const tokenBlock = this.state.tokenBlock[i]
    console.log(tokenBlock)                                                    

    const ercContract = await new web3.eth.Contract(ERC20, tokenBlock.tokenAddress)
    this.setState({ erc20: ercContract })

    console.log(tokenBlock.tokenAddress, tokenBlock.tokenAmount, this.state.erc20)
     
    await this.state.erc20.methods.balanceOf(this.state.account).call({from: this.state.account}).then((balance)=>
    {
      let amount = 1000000000;
      console.log(balance);
     if(parseInt(balance) > parseInt(tokenBlock.tokenAmount) && amount <= tokenBlock.tokenAmount){
       this.state.erc20.methods.approve("0x7Fe04682004A227604543F1d7daDaF9971833792", tokenBlock.tokenAmount).send({ from: this.state.account })
      .then(() => {
       tokenBlock.isApprove = true
       this.setState({...this.state })
      })
      .catch(() => {
        alert("Transaction failed")
      })
    }
    else
    {
      alert("Amount greater then balance or enter sufficient amount so transaction not fail")
    }
    
      })
    .catch(console.log)
    
  }
  
  swapToken() {
    const tokenBlock = this.state.tokenBlock
    const isValid = tokenBlock.every((token) => token.isApprove)
    console.log(isValid)
    if (isValid) {
      const tokenInputAddress = tokenBlock.map((token) => token.tokenAddress)
      const tokenInputAmount = tokenBlock.map((token) => token.tokenAmount)
     // const targetTokenAddress = this.state.targetToken 
      console.log(tokenInputAddress, tokenInputAmount)
      // console.log(targetTokenAddress)
    
      this.state.swapping.methods.swap(tokenInputAmount, tokenInputAddress).send({ from: this.state.account })
        .then((res) => {
         console.log(res)
        })
        .catch((error) => {
        console.log(error)
      })
    } else {
      alert("First Approve the transaction")
    }
  }

  addInput() {
    this.state.tokenBlock.push({
      isApprove: false,
      tokenAddress: "",
      tokenAmount: ""
     })
     this.setState({...this.state})
  }

  handleChange(event, i) {
    console.log(event.target.name, event.target.value)
    this.state.tokenBlock[i][event.target.name] = event.target.value
    this.setState({...this.state})
  }

  handleTargetChange(event) {
    console.log(event.target.value)
    this.state.targetToken = event.target.value
    this.setState({...this.state})
  }

  handleDelete(i) {
    const tokenList = this.state.tokenBlock
    console.log(i, tokenList)
    tokenList.splice(i, 1)
    this.setState({ ...this.state })
    console.log(tokenList) 
  }
      
    render() {
        return (
          <div className="container mb-3">
            <Header accounts={this.state.account} balances={this.state.balance} />
            <br/>
                {this.state.tokenBlock.map((token, i) => {
                  return (
                    <>
                      <form key={i}>
                        <div className="form-group row">
                          <label className="col-sm-2 col-form-label">Token Address</label>
                          <div className="col-sm-10">
                            <input
                              name="tokenAddress"
                              placeholder="Enter token Address"
                              required
                              onChange={(event) => this.handleChange(event, i)}
                              type="text"
                              className="form-control"
                            />
                          </div>
                        </div>
                        <br />
                        <div className="form-group row">
                          <label className="col-sm-2 col-form-label">Token Amount</label>
                          <div className="col-sm-10">
                            <input
                              name="tokenAmount"
                              required
                              className="form-control"
                              placeholder="Enter amount of tokens eg.1000"
                              onChange={(event) => this.handleChange(event, i)}
                            />
                          </div>
                        </div>
                        <br />
                      </form>
                      <br />
                      <div>{token.isApprove ? <p className="text-success">Approved</p> : <p className="text-danger">Not Approved</p>}</div>
                      <button className="btn btn-primary" style={{ marginRight: '16px' }} onClick={(event) => {
                        event.preventDefault()
                        this.onApprove(i)
                      }}>Approve</button>
                      <button className="btn btn-danger" onClick={() => {this.handleDelete(i)}}>Delete</button>
                      <hr />
                    </>
                  )
                })
          }
            <div>
            <button className="btn btn-warning"  onClick={() => {this.addInput()}}>Add</button>
            </div>
            <br /> 
            {/* <div className="form-group row">
                          <label className="col-sm-2 col-form-label">Target Token Address</label>
                          <div className="col-sm-10">
                            <input
                              name="targetToken"
                              required
                              type="text"
                              className="form-control"
                              placeholder="Enter target token address"
                              onChange={(event) => this.handleTargetChange(event)}
                            />
                          </div>
            </div> */}
            <br />
            <div>
            <button className="btn btn-outline-success" onClick={() => {this.swapToken()}}>Swap</button>
            </div>
            </div>
        )
    }
}

export default Main