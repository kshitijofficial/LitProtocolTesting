// Lit.js
import "./init"
import * as LitJsSdk from "@lit-protocol/lit-node-client";

class Lit {
  constructor() {
    this.litNodeClient = new LitJsSdk.LitNodeClient();
  }

  async connect() {
    try{
        await this.litNodeClient.connect();
    }catch(err){
        console.err(err)
    }
  }
}

export default new Lit();
