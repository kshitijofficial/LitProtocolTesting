import { useEffect, useState } from 'react';
import "./init";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import Lit from './lit';
import "./App.css";


function App() {
  const [encryptedString, setEncryptedString] = useState("");
  const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState("");
  const chain = "sepolia";

  useEffect(() => {
    async function initializeLit() {
      try {
        await Lit.connect();
      } catch (err) {
        console.error("Error connecting to Lit:", err);
      }
    }
    initializeLit();
  }, []);

  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain,
      method: "eth_getBalance",
      parameters: [":userAddress", "latest"],
      returnValueTest: {
        comparator: ">=",
        value: "10000000000000",
      },
    },
  ];

  async function encrypt() {
    const message = "Hello World";

    try {
      const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
      const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(message);
      const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
        accessControlConditions,
        symmetricKey,
        authSig,
        chain,
      });

      const encryptedSymmetricKeyString = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16");
      setEncryptedString(encryptedString);
      setEncryptedSymmetricKey(encryptedSymmetricKeyString);
    } catch (err) {
      console.error("Encryption failed:", err);
    }
  }

  async function decrypt() {
    if (encryptedString && encryptedSymmetricKey) {
      try {
        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
        const symmetricKey = await window.litNodeClient.getEncryptionKey({
          accessControlConditions,
          toDecrypt: encryptedSymmetricKey,
          chain,
          authSig
        });

        const decryptedString = await LitJsSdk.decryptString(
          encryptedString,
          symmetricKey
        );

        console.log("Decrypted message:", decryptedString);
      } catch (err) {
        console.error("Decryption failed:", err);
      }
    } else {
      console.log("Key is empty");
    }
  }

  return (
    <div className="App">
      <button onClick={encrypt}>Encrypt</button>
      <br /><br />
      <button onClick={decrypt} disabled={!encryptedString || !encryptedSymmetricKey}>
        Decrypt
      </button>
    </div>
  );
}

export default App;
