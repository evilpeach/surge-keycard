import React, { useState, useEffect, useRef } from 'react'
import { Flex, Text, Box, Image, Button } from 'rebass'
import { get } from 'axios'
import BG from 'images/bg.png'
import Insert from 'images/insert.png'
import ID from 'images/id.png'
import Web3 from 'web3'

window.web3 = new Web3(window.web3.currentProvider)

const baseUrl = 'http://localhost:7777/getCardInfo?timestamp='
// const COMPANY_ADDR = '0x6D09631c692c56ABF90277E0C5AE2b155c4542e5'
const COMPANY_ADDR = '0x68D726910d7A0c0CE17d2bFf74A2d18F8dac49D9'

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
      console.warn('Result', result)
      if (result.address && result.address !== this.state.user.address) {
        const op = x => (x.length < 64 ? op('0' + x) : x)
        const raw = await window.web3.eth.call({
          to: COMPANY_ADDR,
          data: '0x6b7b44d7' + op(result.address.slice(2)),
        })
        const userDetail = window.web3.eth.abi.decodeParameters(
          ['bool', 'string', 'uint256'],
          raw,
        )
        const [imgSrc, name, surname] = userDetail[1].split(',')
        this.setState(
          {
            user: {
              address: result.address,
              sig: result.sig,
              time: time,
              imgSrc,
              name,
              surname,
              userDetail,
              whiteListed: true,
            },
          },
          () => this.claimCheckIn(),
        )
      }
      await sleep(1000)
    }
  }

  render() {
    console.warn('XXX', this.state.user)
    return (
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{
          backgroundImage: `url('${BG}')`,
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
        pt="200px"
      >
        {!this.state.user.whiteListed && (
          <Box style={{ position: 'relative' }}>
            <Image width="800px" src={Insert} />
          </Box>
        )}

        {this.state.user.whiteListed && (
          <Box style={{ position: 'relative' }}>
            <Image width="800px" src={ID} />
            <Text
              fontSize="36px"
              style={{ position: 'absolute', top: 112, left: 300 }}
            >
              {this.state.user.name} {this.state.user.surname}
            </Text>
            <Text
              color="#ababab"
              fontSize="36px"
              style={{ position: 'absolute', top: 200, left: 300 }}
            >
              {new Date().getHours()}:{new Date().getMinutes()}
            </Text>
            <Image
              width="128px"
              height="128px"
              style={{
                position: 'absolute',
                top: 110,
                left: 40,
                borderRadius: '10px',
              }}
              src={this.state.user.imgSrc}
            />
            {/* {this.state.user.address}
            <Button onClick={this.claimCheckIn.bind(this)}>Claim</Button> */}
          </Box>
        )}
      </Flex>
    )
  }
}
