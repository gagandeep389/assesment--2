import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [creditType, setCreditType] = useState(undefined);
  const [creditScoreInput, setCreditScoreInput] = useState("");
  const [age, setAge] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("employed");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const newBalance = await atm.getBalance();
      setBalance(newBalance.toNumber());
      setCreditType(checkCreditType(newBalance.toNumber()));
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const checkCreditType = (creditScore) => {
    if (creditScore >= 800) {
      return "Platinum";
    } else if (creditScore >= 700) {
      return "Diamond";
    } else if (creditScore >= 600) {
      return "Silver";
    } else {
      return "Unknown";
    }
  };

  const handleCreditScoreChange = (event) => {
    setCreditScoreInput(event.target.value);
  };

  const handleAgeChange = (event) => {
    setAge(event.target.value);
  };

  const handleEmploymentStatusChange = (event) => {
    setEmploymentStatus(event.target.value);
  };

  const handleSubmitCreditScore = (event) => {
    event.preventDefault();
    if (creditScoreInput !== "") {
      setCreditType(checkCreditType(parseInt(creditScoreInput)));
    }
  };

  const checkEligibility = () => {
    if (parseInt(age) >= 21 && employmentStatus === "employed") {
      return "Eligible for credit card";
    } else {
      return "Not eligible for credit card";
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    if (ethWallet && account) {
      getATMContract();
    }
  }, [ethWallet, account]);

  useEffect(() => {
    if (atm) {
      getBalance();
    }
  }, [atm]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      <div>
        {ethWallet ? (
          account ? (
            <div>
              <p>Your Account: {account}</p>
              {balance !== undefined && <p>Your Balance: {balance}</p>}
              {creditType && <p>Your Credit Type: {creditType}</p>}
              <button onClick={deposit}>Deposit 1 ETH</button>
              <button onClick={withdraw}>Withdraw 1 ETH</button>
            </div>
          ) : (
            <button onClick={connectAccount}>Please connect your Metamask wallet</button>
          )
        ) : (
          <p>Please install Metamask in order to use this ATM.</p>
        )}
        <form onSubmit={handleSubmitCreditScore}>
          <label>
            Enter your credit score:
            <input type="number" value={creditScoreInput} onChange={handleCreditScoreChange} />
          </label>
          <button type="submit">Submit</button>
        </form>
        <form>
          <label>
            Enter your age:
            <input type="number" value={age} onChange={handleAgeChange} />
          </label>
          <label>
            Employment status:
            <select value={employmentStatus} onChange={handleEmploymentStatusChange}>
              <option value="employed">Employed</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </label>
        </form>
        <p>Credit card eligibility: {checkEligibility()}</p>
      </div>
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
