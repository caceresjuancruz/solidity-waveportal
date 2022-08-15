const JSON_CONTRACT_PATH = '../artifacts/contracts/WavePortal.sol/WavePortal.json';
const contractAddress = '0x4d5B35aeFd18f2Bf3bF0e180989de00db660E1BC'; 
var currentAccount;
var contract;
const rinkebyId = '0x4';
var web3 = new Web3(Web3.givenProvider);

function metamaskReloadCallback()
{
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Accounts changed, realoading...";
    window.location.reload()
  })
  window.ethereum.on('chainChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Network changed, realoading...";
    window.location.reload()
  })
};

const getContract = async () => {
    const response = await fetch(JSON_CONTRACT_PATH);
    const data = await response.json();
    contract = new web3.eth.Contract(data.abi, contractAddress);
    return contract
};

const connectWallet = async () => {
    if (window.ethereum) {
        let chainId = await window.ethereum.request({method: "eth_chainId"});
        console.log("connected to chain: " + chainId);
        if(chainId !== rinkebyId){
            alert("You are not connected to the Rinkeby Testnet!");
        } else {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            window.web3 = new Web3(window.ethereum);
            const account = web3.eth.accounts;
            //Get the current MetaMask selected/active wallet
            currentAccount = account.givenProvider.selectedAddress;
            console.log(`Successfully connected! - Wallet: ${currentAccount}`);
            document.getElementById("connectWalletBtn").textContent = currentAccount;
            getWaves();
        }
    } else {
        console.log("No wallet");
        document.getElementById("connectWalletBtn").textContent = "No wallet installed :(";
    }
};

const wave = async (waveText) => {

    web3.eth.sendTransaction({
        from: currentAccount,
        to: contractAddress,
        data: contract.methods.wave(waveText).encodeABI()
      })
      .on('transactionHash', function(hash){
        document.getElementById("web3_message").textContent="Sending wave...";
      })
      .on('receipt', function(receipt){
        document.getElementById("web3_message").textContent="Success! wave sended.";
        setTimeout(function(){ document.getElementById("web3_message").textContent="";}, 2000);
        getWaves(); })
      .catch((revertReason) => {
        console.log("ERROR! Transaction reverted: " + revertReason)
      });

};

const getWaves = async () => {

    await contract.methods.getAllWaves().call({from: currentAccount})
    .then(function(result){
        parsed = "";
        for (i = result.length; i > 0; i--) {
            var wave = result[i-1];
            parsed += 
            "<article class='card rounded m-2 px-2 fs-4 text-light bg-dark'>" +
                "<div class='card-body'>" +
                "<h5 class='card-title text-info'>"+ wave[0] +"</h5>" +
                "<p class='card-text'>" + wave[1] +"</p>" +
                "<p class='card-text text-secondary'>"+ "Timestamp: " + wave[2] +"</p>" +
                "</div>" + 
            "</article>";
        }
        $("#wavesContainer").empty();                           
        $("#wavesContainer").append(parsed);
    });    
};

const startDapp = () => {
    metamaskReloadCallback();
    getContract();

    $(document).on("submit", "form.wave", function(e){
        e.preventDefault();
        var val = $("#waveText").val();
        wave(val);
        setTimeout(function(){ document.getElementById('waveText').value = "";}, 500);
    });

    contract.events.NewWave(() => {})
    .on("data", getWaves());

}

startDapp();