
import { createSelector } from 'reselect';
import { get, groupBy, reject, maxBy, minBy } from 'lodash';
import moment from 'moment';
import { ethers } from 'ethers';

const GREEN = '#25CE8F'
const RED = '#F45353'

const account = state => get(state, 'provider.account')

const tokens = state => get(state, 'tokens.contracts')

const events = state => get(state, 'exchange.events') 

const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])


const openOrders = state => {
  const all = allOrders(state)
  const filled = filledOrders(state)
  const cancelled = cancelledOrders(state)

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
    const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
    return(orderFilled || orderCancelled)
  })

  return openOrders
}

//this selector is used to show only the events belonging to the account connected in that time to the DEX
export const myEventsSelector = createSelector(
	account,
	events,
	(account, events) => {
		events = events.filter((e) => e.args.user === account)

		return events
	}
)

export const myOpenOrdersSelector = createSelector(
	account,
	tokens,
	openOrders,
	(account, tokens, orders) => {

		if (!tokens[0] || !tokens[1]) { return }

		//filter orders created by current account
		orders = orders.filter((o) => o.user === account)	

		//filter orders by token addresses
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)    
    	orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    	//decorate orders to display with attributes
    	orders = decorateMyOpenOrders(orders, tokens)

    	//order shown as descending time
    	orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    	return orders
	}
) 

const decorateMyOpenOrders = (orders, tokens) => {

	return(
		orders.map((order) => {
			order = decorateOrder(order, tokens)
			order = decorateMyOpenOrder(order, tokens)

			return(order)
		})
	)
}

const decorateMyOpenOrder = (order, tokens) => {

	let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED)
	})
}


const decorateOrder = (order, tokens) => {
	
	let token0Amount, token1Amount

	if (order.tokenGive === tokens[1].address) {
    token0Amount = order.amountGive // The amount of DApp we are giving
    token1Amount = order.amountGet // The amount of mETH we want...
  } else {
    token0Amount = order.amountGet // The amount of DApp we want
    token1Amount = order.amountGive // The amount of mETH we are giving...
  }

  	// Calculate token price 
  const precision = 100000
  let tokenPrice = (token1Amount / token0Amount)
  tokenPrice = Math.round(tokenPrice * precision) / precision


	return ({
    ...order,
    token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
  })
}

export const filledOrdersSelector = createSelector (
	filledOrders,
	tokens,
	(orders, tokens) => {

		if (!tokens[0] || !tokens[1]) { return }

	// Filter orders by selected tokens (this filter is made up to make the orders be contestual every time we choose the pairing tokens market available)
	orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)    
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    //sort orders by time ascending for price comparison
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    //apply order colors (decorate orders)
    orders = decorateFilledOrders(orders, tokens)

    //sort orders by time descending for UI
    orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    return orders

})

const decorateFilledOrders = (orders, tokens) => {

	//track previous orders
	let previousOrder = orders[0]

	return(

		orders.map((order) => {
			order = decorateOrder(order, tokens) /* decorate each individual order */
			order = decorateFilledOrder(order, previousOrder)
			previousOrder = order /* update the previous order once it's decorated */			
			return(order)
		})
	)
	
}

const decorateFilledOrder = (order, previousOrder) => {

	return({
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
	})
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {

	if(previousOrder.id === orderId) {
		return GREEN        /* the first order on the list is green by default */
	}

	if(previousOrder.tokenPrice <= tokenPrice) {
		return GREEN       /* show green color for order that has token price higher than the previous order */
	} else {
		return RED 		   /* show red color for order that has token price lower than the previous order */
	}
}

export const myFilledOrdersSelector = createSelector(
	account,
	tokens,
	filledOrders,
	(account, tokens, orders) => {

		if (!tokens[0] || !tokens[1]) { return }

		//filter orders based on the creator and the user (creator and user are the names used by the raw data)
		orders = orders.filter((o) => o.user === account || o.creator === account)

		//filter orders for current tokens trading pair
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)    
   	 	orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

   	 	//sort orders by time ascending for price comparison
    	orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    	//decorate orders to display with attributes
    	orders = decorateMyFilledOrders(orders, account, tokens)

    	//order shown as descending time in UI
    	orders = orders.sort((a, b) => b.timestamp - a.timestamp)

    	return orders
	}
) 

const decorateMyFilledOrders = (orders, account, tokens) => {

	return(
		orders.map((order) => {
			order = decorateOrder(order, tokens) /* decorate each individual order */
			order = decorateMyFilledOrder(order, account, tokens)
			return(order)
		})
	)
}

const decorateMyFilledOrder = (order, account, tokens) => {

	const myOrder = order.creator === account

	let orderType  
	if(myOrder) {
		orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
	} else {
		orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'
	}

	return({
		...order,
		orderType,
		orderClass: (orderType === 'buy' ? GREEN : RED),
		orderSign: (orderType === 'buy' ? '+' : '-')
		})
}

export const orderBookSelector = createSelector (
	openOrders,
	 tokens, 
	 (orders, tokens) => {

	 	if (!tokens[0] || !tokens[1]) { return }

	 // Filter orders by selected tokens
	orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)


     // Decorate orders (add colors ex. buy=green and sell=red)
    orders = decorateOrderBookOrders(orders, tokens)

    // Group orders by "orderType"
    orders = groupBy(orders, 'orderType')

     // Fetch buy orders
    const buyOrders = get(orders, 'buy', [])

     // Sort buy orders by token price(low-high/high-low)
     orders = {
        ...orders,
        buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    // Fetch sell orders
    const sellOrders = get(orders, 'sell', [])

    // Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    return orders

})


const decorateOrderBookOrders = (orders, tokens) => {
  
  return(
    
    orders.map((order) => {
      order = decorateOrder(order, tokens)
      order = decorateOrderBookOrder(order, tokens)
      
      return(order)
    })
  )
}


const decorateOrderBookOrder = (order, tokens) => {
  
  const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
  })
}


export const priceChartSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }

    // Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // Sort orders by date ascending to compare history
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)

    // Decorate orders - add display attributes
    orders = orders.map((o) => decorateOrder(o, tokens))

    // Get last 2 order for final price & price change
    let secondLastOrder, lastOrder
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)

    // get last order price
    const lastPrice = get(lastOrder, 'tokenPrice', 0)

    // get second last order price
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

    return ({
      lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
      series: [{
        data: buildGraphData(orders)
      }]
    })

  }
)

const buildGraphData = (orders) => {
  // Group the orders by hour for the graph
  orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

  // Get each hour where data exists
  const hours = Object.keys(orders)

  // Build the graph series
  const graphData = hours.map((hour) => {
    
    // Fetch all orders from current hour
    const group = orders[hour]

    // Calculate price values: open, high, low, close
    const open = group[0] // first order
    const high = maxBy(group, 'tokenPrice') // high price
    const low = minBy(group, 'tokenPrice') // low price
    const close = group[group.length - 1] // last order

    return({
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
    })
  })

  return graphData
}
