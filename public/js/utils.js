async function enableEthereum () {
  if (window.ethereum) {
    console.log('New Ethereum API detected!')
    metamask = new Web3(window.ethereum)
    try {
      await window.ethereum.enable()
      console.log('Ethereum enabled...')
    } catch (error) {
      alert(error)
      metamask = undefined
    }
  } else if (window.web3) {
    console.log('Legacy web3 detected!')
    metamask = new Web3(window.web3.currentProvider)
  } else {
    alert('Non-Ethereum browser detected!')
    metamask = undefined
  }
}

function submitTransaction () {
  if (!metamask) {
    alert('Non-Ethereum browser detected!')
    return
  }

  var wastCode = document.getElementById('wastCode').value
  var value = document.getElementById('value').value

  var wasm = ''

  // Validate wast
  if (wastCode.length > 0) {
    // Compile wast to wasm
    try {
      var module = wast2wasm(wastCode)
      wasm = buf2hex(module.toBinary({ log: false }).buffer)
      module.destroy()
    } catch (e) {
      alert(e)
      return
    }

    var wasmLength = wasm.length / 2

    // format hex to "wasm data"
    var wast = ''
    for (var i = 0; i < wasm.length; i += 2) {
      wast += '\\' + wasm.slice(i, i + 2)
    }

    // wrap wasm data into a deployer wast contract
    wast = `(module (import "ethereum" "finish" (func $finish (param i32 i32))) (memory ${Math.floor((wasmLength + 65535) / 65536)}) (data (i32.const 0)  "${wast}") (export "memory" (memory 0)) (export "main" (func $main)) (func $main (call $finish (i32.const 0) (i32.const ${wasmLength}))))`
    console.log(wast)

    // compile deployer wast contract to wasm
    try {
      var module = wast2wasm(wast)
      wasm = buf2hex(module.toBinary({ log: false }).buffer)
      module.destroy()
    } catch (e) {
      alert(e)
      return
    }
  } else {
    alert('Empty wast cannot be deployed.')
    return
  }

  // Create transaction
  let txn = {}
  if (wasm.length > 0) { txn.data = wasm }

  if (value) {
    value = parseInt(value)
    if (isNaN(value)) {
      alert('Must input number as value.')
      return
    } else {
      txn.value = value
    }
  }

  metamask.eth.sendTransaction(txn, function (err, tx) {
    if (err) {
      alert(err)
    } else {
      window.location.href = '/explorer/tx/pending'
    }
  })
}

function validateChainId(chainId, rpcUrlSuggestion) {
  if (metamask.version.network !== chainId) {
    alert(`WARNING: Metamask is connected to a different Ethereum network\nPlease configure the correct RPC endpoint:\n${rpcUrlSuggestion}`);
  }
}
