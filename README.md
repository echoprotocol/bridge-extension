
# BRIDGE    
 Echo browser extension  
  ## Connect to node  
  
There is an example of connecting to the node and subscribe to switch network (recommended to use inside `window.onload`)  
  
```javascript  
window.onload = function() {   
    window.echojslib.extension.subscribeSwitchNetwork(data => {    
        console.log("subscriber: ", data);   
        if (window.echojslib._ws._connected) {    
            window.echojslib.disconnect();    
        }   
        window.echojslib.connect();  
    }); 
};  
```  
Callback will be called, when network will be changed in extension.  
## Sign transaction with Bridge  
  
### Transfer  
  
Simple example of creating and broadcasting transaction  
  
```javascript  
const tr = window.echojslib.createTransaction();  

tr.addOperation(echojslib.constants.OPERATIONS_IDS.TRANSFER,  {   
    from:  "1.2.1",  
    to:  "1.2.2",   
    amount:  { asset_id:  "1.3.0", amount:  10  }
});  

await tr.signWithBridge();  

await tr.broadcast();  
```  
Method `addOperation(operationNumber, operationOptions)` in this example used transfer operation.  
  
### Transaction examples
  
See the [examples](./docs/examples.md) for more different transactions.