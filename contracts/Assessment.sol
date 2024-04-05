 // SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    enum CreditCardType { Unknown, Silver, Diamond, Platinum }

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function checkCreditCardType(uint256 creditScore) public pure returns (CreditCardType) {
        if (creditScore >= 800) {
            return CreditCardType.Platinum;
        } else if (creditScore >= 700) {
            return CreditCardType.Diamond;
        } else if (creditScore >= 600) {
            return CreditCardType.Silver;
        } else {
            return CreditCardType.Unknown;
        }
    }

    function checkCreditCardEligibility(uint256 age, bool employed) public pure returns (bool) {
        if (age >= 21 && employed) {
            return true;
        } else {
            return false;
        }
    }
}
