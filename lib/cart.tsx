'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

export interface CartItem {
  id: string
  slug: string
  name: string
  image: string
  price: number
  size: string
  flavor: string
  customMessage: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; size: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_OPEN'; payload: boolean }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const key = `${action.payload.id}-${action.payload.size}-${action.payload.flavor}`
      const existing = state.items.find(
        item => `${item.id}-${item.size}-${item.flavor}` === key
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            `${item.id}-${item.size}-${item.flavor}` === key
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          item => `${item.id}-${item.size}-${item.flavor}` !== action.payload
        ),
      }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          `${item.id}-${item.size}` === `${action.payload.id}-${action.payload.size}`
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'SET_OPEN':
      return { ...state, isOpen: action.payload }
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  cartCount: number
  cartTotal: number
}>({
  state: { items: [], isOpen: false },
  dispatch: () => null,
  cartCount: 0,
  cartTotal: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })

  useEffect(() => {
    const stored = localStorage.getItem('xoxo-cart')
    if (stored) {
      const items = JSON.parse(stored) as CartItem[]
      items.forEach(item => dispatch({ type: 'ADD_ITEM', payload: item }))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('xoxo-cart', JSON.stringify(state.items))
  }, [state.items])

  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ state, dispatch, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
