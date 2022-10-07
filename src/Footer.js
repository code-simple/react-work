import React from 'react'

const Footer = ({itemLen}) => {
  const today = new Date();

    return (
    <footer>
        <p>
            {itemLen}  {itemLen>1?'Items':'Item Only'}
        </p>
    </footer>
  )
}

export default Footer