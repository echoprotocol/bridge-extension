# BRIDGE


```javascript
window.onload = function() {
        
        if (window.echojslib && window.echojslib.isEchoBridge) {

                window.echojslib.extension.subscribeSwitchNetwork(data => {
                    console.log("subscriber: ", data);
                });

                await window.echojslib.connect();

                const tr = window.echojslib.createTransaction();

                tr.addOperation(window.echojslib.constants.OPERATIONS_IDS.TRANSFER, {
                    from: "1.2.16",
                    to: "1.2.456",
                    amount: { asset_id: "1.3.0", amount: 10 }
                });

                await tr.signWithBridge();

                await tr.broadcast();

        }
        
}
```