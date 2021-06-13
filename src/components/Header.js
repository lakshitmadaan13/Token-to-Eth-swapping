import React from 'react'

const Header = ({accounts, balances}) => {
    return (
        <div className="container">
            <div>
            <h5>Your Account Address: {accounts}</h5>
            <h5>Balance: {window.web3.utils.fromWei(balances.toString(), 'ether')} ETH</h5>
           </div>
        </div>
    )
}

export default Header