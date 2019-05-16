
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
