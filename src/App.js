// Necessary imports
import { ethers } from "ethers";
import React from "react";
import abi from './utils/MyEpicNFT.json';
import './App.css';

// Set global variables above
const contractAddress = '0x064656d225CfE77Ca3b9dCa23D6fB2a47A5a1121';
const contractABI = abi.abi;

class App extends React.Component {
  constructor(props) {
    // Set state properties
    super(props);
    this.state = {name: '', address: '', message: '', sender: '', currentAccount: '', transactionSent: '', transactionProcessing: ''};

    // Set event handlers
    this.handleName = this.handleName.bind(this);
    this.handleAddress = this.handleAddress.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleSender = this.handleSender.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.connectWallet = this.connectWallet.bind(this);
    this.sendNFT = this.sendNFT.bind(this);
  }

  // Connect wallet
  async connectWallet(event) {
    try {
      const { ethereum } = window;
    
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      this.setState({currentAccount: accounts[0]})
    } catch (error) {
      console.log(error)
    }
  }

  // Handling updates to individual fields
  handleName(event) {
    this.setState({name: event.target.value});
  }

  handleAddress(event) {
    this.setState({address: event.target.value});
  }

  handleMessage(event) {
    this.setState({message: event.target.value});
  }

  handleSender(event) {
    this.setState({sender: event.target.value});
  }

  // Handling submits
  handleSubmit(event) {
    // Construct SVG using Base64
    const svg_string = '<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><rect x="-1.587" y="0.193" width="501.967" height="499.382" style="fill: rgb(232, 15, 15); stroke: rgba(0, 0, 0, 0);"/><text style="fill: rgb(255, 255, 255); font-family: Chalkboard; font-size: 34px; white-space: pre;" x="26.444" y="58.244">To: ' + this.state.name + '</text><text style="fill: rgb(255, 255, 255); font-family: Chalkboard; font-size: 34px; white-space: pre;" x="33.045" y="184.384">From: ' + this.state.sender + '</text><text style="fill: rgb(255, 255, 255); font-family: Chalkboard; font-size: 34px; white-space: pre;" x="29.121" y="320.996">Message: ' + this.state.message + '</text><text style="fill: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 30px; white-space: pre;" x="452.54" y="37.208"></text></svg>'
    const encodedData = window.btoa(svg_string);
    console.log(encodedData);

    // Construct NFT metadata
    const nft_metadata = {
      "name": "Happy Holidays from " + this.state.sender + " to " + this.state.name,
      "description": this.state.message,
      "image": "data:image/svg+xml;base64," + encodedData
    };

    // Encode NFT metadata
    const nft_json = JSON.stringify(nft_metadata) // convert Object to a String
    const nft_encoded = "data:application/json;base64," + window.btoa(nft_json)
    console.log(nft_encoded);
    this.sendNFT(nft_encoded);

    // Prevent default
    event.preventDefault();
  }

  async sendNFT(metadata) {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const NFTContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Send NFT
        const waveTxn = await NFTContract.makeAnEpicNFT(metadata, this.state.address)
        this.setState({transactionProcessing: 'Processing'});
        console.log("Mining...", waveTxn.hash);

        // Await transaction and set state
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        this.setState({transactionProcessing: ''});
        this.setState({transactionSent: 'Sent Transaction'});
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <>
    <div className="container">
      <br />
      <div className="card">
        <div className="card-body">
      <h1><b>🎅🏻 Christmas NFTs</b></h1>
      <p>Send one of your friends a custom Christmas NFT! Check out the full collection <a href="https://rinkeby.rarible.com/collection/0x064656d225cfe77ca3b9dca23d6fb2a47a5a1121">here</a>.</p>
      {!this.state.currentAccount && (
        <button type="button" className="btn btn-danger" onClick={this.connectWallet}>Connect Wallet</button>
      )}
      {this.state.currentAccount && (
      <>
        <p><b>Address: {this.state.currentAccount}</b></p>
        <form onSubmit={this.handleSubmit}>
          <label>
            Recipient's Name: <br />
            <input type="text" value={this.state.name} onChange={this.handleName} />
          </label>
          <br /> <br />
          <label>
            Recipient's Address: <br />
            <input type="text" value={this.state.address} onChange={this.handleAddress} />
          </label>
          <br /> <br />
          <label>
            Message: <br />
            <input type="text" value={this.state.message} onChange={this.handleMessage} />
          </label>
          <br /> <br />
          <label>
            Sender's Name: <br />
            <input type="text" value={this.state.sender} onChange={this.handleSender} />
          </label>
          <br /> <br />
          <input className="btn btn-danger" type="submit" value="Submit" />
        </form>
      </>)}
      {this.state.transactionProcessing && (
        <>
          <br />
          <p>Minting and sending to address...</p>
        </>
      )}
      {this.state.transactionSent && (
        <>
          <br />
          <p>Transaction sent!</p>
        </>
      )}
      <br />
      </div>
      </div>
    </div>
    </>
    );
  }
}

export default App;
