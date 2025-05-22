import eventListeners from '../eventListeners'
import { removeGlobalEffects } from '../reactivity/effect'
import Symbols from '../symbols'

const pools = {}

const reinitialize = (props, parent, component) => {
  component['parent'] = parent

  // we should reapply props to the component
  const propsObj = component[Symbols.props]
  for (const key in props) {
    propsObj[key] = props[key]
  }

  const wrapper = component[Symbols.wrapper]
  if (wrapper) {
    wrapper.node.parent = parent.node // reconnect L3 CoreNode to holder parent
    wrapper.props.props.parent = parent // reconnect parent reference to wrapper
    console.log('Reconnected wrapper to holder', component[Symbols.id], ' ->', wrapper.node.id)
  } else {
    console.warn('No wrapper found for component', component[Symbols.id])
    debugger
  }

  // finaly set the lifecycle state to ready (in the next tick)
  setTimeout(() => (component.lifecycle.state = 'ready'))
}

export function acquire(component, props, parent, createFn) {
  const type = component['parent'] && component['parent']['componentId']
  const pool = pools[type]

  //return pool && pool.length > 0 ? pool.pop() : createFn()
  if (pool && pool.length > 0) {
    const component = pool.pop()
    console.log('Acquired component from pool', component[Symbols.id], '->', type)
    reinitialize(props, parent, component)
    return component
  } else {
    return createFn()
  }
}

/**
 * Push a component back into its pool based on type.
 * @param {object} element - The component to be released
 */
export function release(element) {
  if (!element) return

  // Blits can use either be a component or a element
  // lets find the component
  let component = element['component']
  if (!component && element['componentId']) {
    component = element
  }

  // We're only pooling components in the for loop
  if (component.index === undefined || component.activeRow === undefined) {
    element['destroy'] && element['destroy']()
    return
  }

  // get parent type
  const type = component['parent'] && component['parent']['componentId']
  if (!type) {
    console.warn('No parent found for component', component[Symbols.id])
    debugger
  }

  console.log('Releasing component to pool', component[Symbols.id], '->', type)

  // init pool for type if needed
  let pool = pools[type]
  if (pool === undefined) {
    pool = []
    pools[type] = pool
  }

  // reset values
  component.$clearTimeouts()
  component.$clearIntervals()
  eventListeners.removeListeners(component)
  // deleteChildren(this[symbols.children])
  // removeGlobalEffects(component[symbols.effects])
  // component[symbols.state] = {}
  // component[symbols.props] = {}
  // component[symbols.effects].length = 0

  // if the component has a parent, remove it from the parent's children
  if (component['parent']) {
    const children = component['parent'][Symbols.children]
    let index = -1
    for (let i = 0; i < children.length; i++) {
      if (children[i][Symbols.id] === component[Symbols.id]) {
        index = i
        break
      }
    }

    if (index > -1) {
      children.splice(index, 1)
    }

    component['parent'] = null
  } else {
    console.warn('No parent found for component', component[Symbols.id])
    debugger
  }

  // disconnect wrapper from holder
  const wrapper = component[Symbols.wrapper]
  if (wrapper) {
    wrapper.node.parent = null // disconnect L3 CoreNode from holder parent
    wrapper.props.props.parent = null // delete parent reference from wrapper
    console.log('Disconnected wrapper from holder', component[Symbols.id], ' ->', wrapper.node.id)
  } else {
    console.warn('No wrapper found for component', component[Symbols.id])
    debugger
  }

  pool.push(component)
}
