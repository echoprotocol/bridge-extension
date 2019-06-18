
# BRIDGE    
 Echo browser extension


## Get access to use Bridge data

 Before connecting to Bridge you need to get access for using Brige.

 ```javascript
    /**
     * Get access
     * @returns {Promise.<Boolean>} status
     */
    await echojslib.extension.getAccess();
 ```


## Connect to node  

There is an example of connecting to the node and subscribe to switch network (recommended to use inside `window.onload`)  

```javascript  
window.onload = () => {

    if (echojslib && echojslib.isEchoBridge) {

        /**
        * Subscribe to current Echo network selected in Bridge
        */
        await echojslib.extension.subscribeSwitchNetwork(async () => {

            if (echojslib.echo.isConnected) {
                await window.echojslib.echo.disconnect();
            }

            /**
            * Connect to current Echo network selected in Bridge
            */
            await echojslib.echo.connect();

        });

    }
};  
```  
Callback will be called, when network will be changed in extension.  
## Sign transaction with Bridge  

### Transfer  

Simple example of creating and broadcasting transaction  

```javascript  
/**
* Create a transaction
* @type {Transaction}
*/
const tr = window.echojslib.echo.createTransaction();  

/**
* Add transfer operation
*/
tr.addOperation(echojslib.constants.OPERATIONS_IDS.TRANSFER,  {   
    from:  "1.2.1",  
    to:  "1.2.2",   
    amount:  { asset_id:  "1.3.0", amount:  10  }
});  

/**
* Sign the transaction with Bridge
*/
await tr.signWithBridge();  

/**
* Broadcast the transaction to blockchain
*/
await tr.broadcast();  
```  
Method `addOperation(operationNumber, operationOptions)` in this example used transfer operation.  

### Transaction examples

See the [examples](./docs/examples.md) for more different transactions.

## Payload signing
In order for the user to confirm ownership of the account's private key, the extension suggests using the proofOfAuthority method. The method provides an opportunity to sign payload by account private key. Because the raw signing can potentially sign transactions or even leak its private key we have to add an extra layer of encryption. So the extension will sign payload instead of raw data.

```javascript  
/**
* Get signature
* @returns {Promise.<String>} signature
*/
await echojslib.extension.proofOfAuthority('This is example message!', '1.2.134');
```

To verifying the signature use echojs-lib.

```javascript  
import { ED25519 } from 'echojs-lib';
import bs58 from 'bs58';

const signature = Buffer.from('757a8b60f4c348e8de49f8dc56563db5d9903be41c7aad145cc8be5c6f66804c168693232c0f150ef017bc01697fc0aca5000a04ac6756d36430aeaefe518b08', 'hex');
const message = Buffer.from('This is example message!', 'utf8');
const publicKey = bs58.decode('ECHOJDpsaMaR9qWM2922ZYvQ3xpavsN8oeNN8zBx1VNKdQBf'.slice(4));

ED25519.verifyMessage(signature, message, publicKey);
```
