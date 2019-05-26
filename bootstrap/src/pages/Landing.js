import React, { useState, useEffect, useRef } from 'react'
import { Flex, Text, Button } from 'rebass'
import { get } from 'axios'
import Web3 from 'web3'

window.web3 = new Web3(window.web3.currentProvider)

const baseUrl = 'http://localhost:8888/getCardInfo?timestamp='
const COMPANY_ADDR = '0x6D09631c692c56ABF90277E0C5AE2b155c4542e5'

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

// const useInterval = (callback, delay) => {
//   const savedCallback = useRef()

//   useEffect(() => {
//     savedCallback.current = callback
//   }, [callback])

//   useEffect(() => {
//     if (delay !== null) {
//       let id = setInterval(() => savedCallback.current(), delay)
//       return () => clearInterval(id)
//     }
//   }, [delay])
// }

export default class Test extends React.Component {
  state = {
    user: {},
  }

  async claimCheckIn() {
    const result = await window.web3.eth.sendTransaction({
      from: (await window.web3.eth.getAccounts())[0],
      to: COMPANY_ADDR,
      data:
        '0x754685c5' +
        window.web3.eth.abi
          .encodeParameters(
            ['uint256', 'bytes'],
            [this.state.user.time, this.state.user.sig],
          )
          .slice(2),
    })
    console.warn(result)
  }

  async componentDidMount() {
    while (true) {
      const time = Math.floor(Date.now() / 1000) + ''
      const {
        data: { result },
      } = await get(baseUrl + time)
      // setUser(result)
      if (result.address !== this.state.user.address) {
        const op = x => (x.length < 64 ? op('0' + x) : x)
        const raw = await window.web3.eth.call({
          to: COMPANY_ADDR,
          data: '0x6b7b44d7' + op(result.address.slice(2)),
        })
        const userDetail = window.web3.eth.abi.decodeParameters(
          ['bool', 'string', 'uint256'],
          raw,
        )
        console.warn(userDetail[1].split(','))
        this.setState({
          user: {
            address: result.address,
            sig: result.sig,
            time: time,
            detail: userDetail,
            whiteListed: true,
          },
        })
      }
      await sleep(1000)
    }
  }
  render() {
    return (
      <Flex flexDirection="column" alignItems="center">
        {!this.state.user.whiteListed && (
          <Flex
            justifyContent="center"
            alignItems="center"
            style={{ height: '100vh' }}
          >
            <Text fontWeight={600} fontSize={24}>
              Please insert student card
            </Text>
          </Flex>
        )}
        {this.state.user.whiteListed && (
          <Flex flexDirection="column" my={4} alignItems="center">
            {this.state.user.address}
            <Button onClick={this.claimCheckIn.bind(this)}>Claim</Button>
          </Flex>
        )}
      </Flex>
    )
  }
}
