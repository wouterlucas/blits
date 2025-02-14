/*
 * Copyright 2023 Comcast Cable Communications Management, LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'tape'
import generator from './generator.js'

const normalize = (str) => {
  return (
    str
      // remove comments
      .replace(/\s*\/\/.*\n/gi, '')
      // remove whitespaces
      .replace(/[\n\s\t]/gi, '')
  )
}

const scope = {
  components: {},
}

test('Type', (assert) => {
  const expected = 'function'
  const actual = typeof generator

  assert.equal(actual, expected, 'Generator should be a function')
  assert.end()
})

test('Returns an object with a render function and a context object', (assert) => {
  const result = generator.call(scope)
  const expected = 'object'
  const actual = typeof result

  assert.equal(actual, expected, 'Generator should return an object')
  assert.ok('render' in result, 'Generated object should have a render key')
  assert.ok('effects' in result, 'Generated object should have an effects key')
  assert.ok('context' in result, 'Generated object should have a context key')
  assert.end()
})

test('The render key is a function', (assert) => {
  const result = generator.call(scope)
  const expected = 'function'
  const actual = typeof result.render

  assert.equal(actual, expected, 'Render key should return a function')
  assert.end()
})

test('The effects key is an array (of functions)', (assert) => {
  const result = generator.call(scope)
  const actual = Array.isArray(result.effects)

  assert.ok(actual, 'Update key should return an Array')
  assert.end()
})

test('The contex key is an object', (assert) => {
  const result = generator.call(scope)
  const expected = 'object'
  const actual = typeof result.context

  assert.equal(actual, expected, 'Context key should return an object')
  assert.end()
})

test('Generate render and effect code for an empty template', (assert) => {
  const expectedRender = `
  function anonymous(parent,component,context) {
      // this is a comment
      const elms = []
      return elms
  }
  `

  const actual = generator.call(scope)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate render and effect code for a template with a single simple element', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }
      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with a simple element and a simple nested element', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
    const elms = []

    if(!elms[0]) {
      elms[0] = this.element({parent: parent || 'root'}, component)
    }
    const elementConfig0 = {}

    if(!elms[0].nodeId) {
      elms[0].populate(elementConfig0)
    }

    parent = elms[0]

    if(!elms[1]) {
      elms[1] = this.element({parent: parent || 'root'}, component)
    }
    const elementConfig1 = {}

    if(!elms[1].nodeId) {
      elms[1].populate(elementConfig1)
    }

    return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with a single element with attributes', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        x: '10',
        y: '20',
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      elementConfig0['x'] = 10
      elementConfig0['y'] = 20

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }
      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with a single element with attributes with a boolean like value', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        one: 'true',
        two: 'false',
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      elementConfig0['one'] = true
      elementConfig0['two'] = false

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }
      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with attributes and a nested element with attributes', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        x: '10',
        y: '20',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
            w: '100',
            h: '300',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      elementConfig0['x'] = 10
      elementConfig0['y'] = 20

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig1 = {}

      elementConfig1['w'] = 100
      elementConfig1['h'] = 300

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with attributes and 2 nested elements with attributes', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        x: '10',
        y: '20',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
            w: '100',
            h: '300',
            x: '0',
          },
          {
            [Symbol.for('componentType')]: 'Element',
            w: '100',
            h: '300',
            x: '50',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig0 = {}

      elementConfig0['x'] = 10
      elementConfig0['y'] = 20

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig1 = {}

      elementConfig1['w'] = 100
      elementConfig1['h'] = 300
      elementConfig1['x'] = 0

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[0]

      if(!elms[2]) {
        elms[2] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig2 = {}

      elementConfig2['w'] = 100
      elementConfig2['h'] = 300
      elementConfig2['x'] = 50

      if(!elms[2].nodeId) {
        elms[2].populate(elementConfig2)
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with attributes and deep nested elements with attributes', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        x: '10',
        y: '20',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
            w: '100',
            h: '300',
            x: '0',
          },
          {
            [Symbol.for('componentType')]: 'Element',
            w: '100',
            h: '300',
            x: '50',
            children: [
              {
                [Symbol.for('componentType')]: 'Element',
                label: 'Hello',
              },
              {
                [Symbol.for('componentType')]: 'Element',
                label: 'World',
              },
            ],
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      elementConfig0['x'] = 10
      elementConfig0['y'] = 20

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig1 = {}

      elementConfig1['w'] = 100
      elementConfig1['h'] = 300
      elementConfig1['x'] = 0

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[0]

      if(!elms[2]) {
        elms[2] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig2 = {}

      elementConfig2['w'] = 100
      elementConfig2['h'] = 300
      elementConfig2['x'] = 50

      if(!elms[2].nodeId) {
        elms[2].populate(elementConfig2)
      }

      parent = elms[2]

      if(!elms[3]) {
        elms[3] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig3 = {}

      elementConfig3['label'] = "Hello"

      if(!elms[3].nodeId) {
        elms[3].populate(elementConfig3)
      }

      parent = elms[2]

      if(!elms[4]) {
        elms[4] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig4 = {}

      elementConfig4['label'] = "World"

      if(!elms[4].nodeId) {
        elms[4].populate(elementConfig4)
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with simple dynamic attributes', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        x: '10',
        y: '20',
        ':w': '$foo',
        ':h': '$test',
        test: 'ok',
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      elementConfig0['x'] = 10
      elementConfig0['y'] = 20
      elementConfig0['test'] = "ok"

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      return elms
  }
  `

  const expectedEffect1 = `
  function anonymous(component,elms,context) {
    elms[0].set('w', component.foo)
  }
  `

  const expectedEffect2 = `
  function anonymous(component,elms,context) {
    elms[0].set('h', component.test)
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 2,
    'Generator should return an effects array with 2 items'
  )
  assert.equal(
    normalize(actual.effects[0].toString()),
    normalize(expectedEffect1),
    'Generator should return first render function with the correct code'
  )
  assert.equal(
    normalize(actual.effects[1].toString()),
    normalize(expectedEffect2),
    'Generator should return second render function with the correct code'
  )

  assert.end()
})

test('Generate code for a template with an attribute with a dash', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        'my-Attribute': 'does it work?',
        x: '10',
        y: '20',
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      elementConfig0['my-Attribute'] = "does it work?"
      elementConfig0['x'] = 10
      elementConfig0['y'] = 20

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with dynamic attributes with code to be evaluated', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        ':attribute1': '$foo * 2',
        ':attribute2': "$ok ? 'Yes' : 'No'",
        ':attribute3': "$text.split('').reverse().join('')",
        // ':attribute4': '$bar.foo * $blah.hello' => todo
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      return elms
  }
  `

  const expectedEffect1 = `
  function anonymous(component,elms,context) {
    elms[0].set('attribute1', component.foo * 2)
  }
  `

  const expectedEffect2 = `
  function anonymous(component,elms,context) {
    elms[0].set('attribute2', component.ok ? 'Yes' : 'No')
  }
  `

  const expectedEffect3 = `
  function anonymous(component,elms,context) {
    elms[0].set('attribute3', component.text.split('').reverse().join(''))
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 3,
    'Generator should return an effects array with 3 items'
  )
  assert.equal(
    normalize(actual.effects[0].toString()),
    normalize(expectedEffect1),
    'Generator should return first effect function with the correct code'
  )
  assert.equal(
    normalize(actual.effects[1].toString()),
    normalize(expectedEffect2),
    'Generator should return second effect function with the correct code'
  )
  assert.equal(
    normalize(actual.effects[2].toString()),
    normalize(expectedEffect3),
    'Generator should return third effect function with the correct code'
  )

  assert.end()
})

test('Generate code for a template with @-listeners', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        src: 'myImage.png',
        '@loaded': '$loadedCallback',
        '@error': '$errorCallback',
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      elementConfig0['src'] = "myImage.png"
      elementConfig0['@loaded'] = component['loadedCallback'] && component['loadedCallback'].bind(component)
      elementConfig0['@error'] = component['errorCallback'] && component['errorCallback'].bind(component)

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }
      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with custom components', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Poster',
          },
          {
            [Symbol.for('componentType')]: 'Poster',
          },
        ],
      },
    ],
  }

  const scope = {
    components: {
      Poster: () => {},
    },
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      const cmp1 = (context.components && context.components['Poster']) ||
        component[Symbol.for('components')]['Poster']

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig1 = {}
      if(typeof cmp1 !== 'undefined') {
        for(let key in cmp1.config.props) {
          delete  elementConfig1[cmp1.config.props[key]]
        }
      }

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]
      const props2 = {}
      if(!elms[2]) {
        const componentType = props2['is'] || 'Poster'
        elms[2] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Poster not found')})).call(null, {props: props2}, elms[1], component)
        if (elms[2][Symbol.for('slots')][0]) {
          parent = elms[2][Symbol.for('slots')][0]
          component = elms[2]
        } else {
          parent = elms[2][Symbol.for('children')][0]
        }
      }

      const cmp3 = (context.components && context.components['Poster']) ||
        component[Symbol.for('components')]['Poster']

      parent = elms[0]

      if(!elms[3]) {
        elms[3] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig3 = {}
      if(typeof cmp3 !== 'undefined') {
        for(let key in cmp3.config.props) {
          delete  elementConfig3[cmp3.config.props[key]]
        }
      }

      if(!elms[3].nodeId) {
        elms[3].populate(elementConfig3)
      }

      parent = elms[3]
      const props4 = {}
      if(!elms[4]) {
        const componentType = props4['is'] || 'Poster'
        elms[4] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Poster not found')})).call(null, {props: props4}, elms[3], component)
        if (elms[4][Symbol.for('slots')][0]) {
          parent = elms[4][Symbol.for('slots')][0]
          component = elms[4]
        } else {
          parent = elms[4][Symbol.for('children')][0]
        }
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )

  assert.end()
})

test('Generate code for a template with an unregistered custom component', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Poster',
          },
          {
            [Symbol.for('componentType')]: 'Poster2',
          },
        ],
      },
    ],
  }

  const scope = {
    components: {
      Poster: () => {},
    },
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      const cmp1 = (context.components && context.components['Poster']) ||
        component[Symbol.for('components')]['Poster']

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig1 = {}
      if(typeof cmp1 !== 'undefined') {
        for(let key in cmp1.config.props) {
          delete  elementConfig1[cmp1.config.props[key]]
        }
      }

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]
      const props2 = {}
      if(!elms[2]) {
        const componentType = props2['is'] || 'Poster'
        elms[2] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Poster not found')})).call(null, {props: props2}, elms[1], component)
        if (elms[2][Symbol.for('slots')][0]) {
          parent = elms[2][Symbol.for('slots')][0]
          component = elms[2]
        } else {
          parent = elms[2][Symbol.for('children')][0]
        }
      }

      const cmp3 = (context.components && context.components['Poster2']) ||
        component[Symbol.for('components')]['Poster2']

      parent = elms[0]

      if(!elms[3]) {
        elms[3] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig3 = {}
      if(typeof cmp3 !== 'undefined') {
        for(let key in cmp3.config.props) {
          delete  elementConfig3[cmp3.config.props[key]]
        }
      }

      if(!elms[3].nodeId) {
        elms[3].populate(elementConfig3)
      }

      parent = elms[3]
      const props4 = {}
      if(!elms[4]) {
        const componentType = props4['is'] || 'Poster2'
        elms[4] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Poster2 not found')})).call(null, {props: props4}, elms[3], component)
        if (elms[4][Symbol.for('slots')][0]) {
          parent = elms[4][Symbol.for('slots')][0]
          component = elms[4]
        } else {
          parent = elms[4][Symbol.for('children')][0]
        }
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )

  assert.end()
})

test('Generate code for a template with custom components with arguments', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Poster',
            x: '10',
          },
          {
            [Symbol.for('componentType')]: 'Poster',
            x: '100',
            img: '$img',
          },
        ],
      },
    ],
  }

  const scope = {
    components: {
      Poster: () => {},
    },
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      const cmp1 = (context.components && context.components['Poster']) ||
        component[Symbol.for('components')]['Poster']

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig1 = {}

      elementConfig1['x'] = 10

      if(typeof cmp1 !== 'undefined') {
        for(let key in cmp1.config.props) {
          delete  elementConfig1[cmp1.config.props[key]]
        }
      }

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]
      const props2 = {}

      props2['x'] = 10

      if(!elms[2]) {
        const componentType = props2['is'] || 'Poster'
        elms[2] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Poster not found')})).call(null, {props: props2}, elms[1], component)
        if (elms[2][Symbol.for('slots')][0]) {
          parent = elms[2][Symbol.for('slots')][0]
          component = elms[2]
        } else {
          parent = elms[2][Symbol.for('children')][0]
        }
      }

      const cmp3 = (context.components && context.components['Poster']) ||
        component[Symbol.for('components')]['Poster']

      parent = elms[0]

      if(!elms[3]) {
        elms[3] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig3 = {}

      elementConfig3['x'] = 100
      elementConfig3['img'] = component.img

      if(typeof cmp3 !== 'undefined') {
        for(let key in cmp3.config.props) {
          delete  elementConfig3[cmp3.config.props[key]]
        }
      }

      if(!elms[3].nodeId) {
        elms[3].populate(elementConfig3)
      }

      parent = elms[3]
      const props4 = {}

      props4['x'] = 100
      props4['img'] = component.img

      if(!elms[4]) {
        const componentType = props4['is'] || 'Poster'
        elms[4] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Poster not found')})).call(null, {props: props4}, elms[3], component)
        if (elms[4][Symbol.for('slots')][0]) {
          parent = elms[4][Symbol.for('slots')][0]
          component = elms[4]
        } else {
          parent = elms[4][Symbol.for('children')][0]
        }
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )

  assert.end()
})

test('Generate code for a template with custom components with reactive props', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Poster',
            x: '10',
            ':img': '$image',
          },
          {
            [Symbol.for('componentType')]: 'Poster',
            x: '100',
            ':img': '$image',
          },
        ],
      },
    ],
  }

  const scope = {
    components: {
      Poster: () => {},
    },
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      const cmp1 = (context.components && context.components['Poster']) ||
        component[Symbol.for('components')]['Poster']

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig1 = {}

      elementConfig1['x'] = 10

      if(typeof cmp1 !== 'undefined') {
        for(let key in cmp1.config.props) {
          delete  elementConfig1[cmp1.config.props[key]]
        }
      }

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]
      const props2 = {}

      props2['x'] = 10
      props2['img'] = component.image

      if(!elms[2]) {
        const componentType = props2['is'] || 'Poster'
        elms[2] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Poster not found')})).call(null, {props: props2}, elms[1], component)
        if (elms[2][Symbol.for('slots')][0]) {
          parent = elms[2][Symbol.for('slots')][0]
          component = elms[2]
        } else {
          parent = elms[2][Symbol.for('children')][0]
        }
      }

      const cmp3 = (context.components && context.components['Poster']) ||
        component[Symbol.for('components')]['Poster']

      parent = elms[0]

      if(!elms[3]) {
        elms[3] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig3 = {}

      elementConfig3['x'] = 100

      if(typeof cmp3 !== 'undefined') {
        for(let key in cmp3.config.props) {
          delete  elementConfig3[cmp3.config.props[key]]
        }
      }

      if(!elms[3].nodeId) {
        elms[3].populate(elementConfig3)
      }

      parent = elms[3]
      const props4 = {}

      props4['x'] = 100
      props4['img'] = component.image

      if(!elms[4]) {
        const componentType = props4['is'] || 'Poster'
        elms[4] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Poster not found')})).call(null, {props: props4}, elms[3], component)
        if (elms[4][Symbol.for('slots')][0]) {
          parent = elms[4][Symbol.for('slots')][0]
          component = elms[4]
        } else {
          parent = elms[4][Symbol.for('children')][0]
        }
      }

      return elms
  }
  `

  const expectedEffect1 = `
  function anonymous(component,elms,context) {
    elms[1].set('img', component.image)
  }
  `

  const expectedEffect2 = `
  function anonymous(component,elms,context) {
    elms[2][Symbol.for('props')]['img'] = component.image
  }
  `

  const expectedEffect3 = `
  function anonymous(component,elms,context) {
    elms[3].set('img', component.image)
  }
  `

  const expectedEffect4 = `
  function anonymous(component,elms,context) {
    elms[4][Symbol.for('props')]['img'] = component.image
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )

  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 4,
    'Generator should return an effects array with 4 functions'
  )

  assert.equal(
    normalize(actual.effects[0].toString()),
    normalize(expectedEffect1),
    'Generator should return an effect function that sets the value on the node'
  )

  assert.equal(
    normalize(actual.effects[1].toString()),
    normalize(expectedEffect2),
    'Generator should return an effect function that updates a prop on the first custom component'
  )

  assert.equal(
    normalize(actual.effects[2].toString()),
    normalize(expectedEffect3),
    'Generator should return an effect function that sets the value on the node'
  )

  assert.equal(
    normalize(actual.effects[3].toString()),
    normalize(expectedEffect4),
    'Generator should return an effect function that updates a prop on the second custom component'
  )

  assert.end()
})

test('Generate code for a template with a transition attributes', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        x: '{transition: $myX}',
        y: '{transition: {v: $myY, d: 600, p: 100}}',
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      elementConfig0['x'] = "{transition: $myX}"
      elementConfig0['y'] = "{transition: {v: $myY, d: 600, p: 100}}"

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with slot content', (assert) => {
  const scope = {
    components: {
      Page: () => {},
    },
  }

  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Page',
            w: '1920',
            h: '1080',
            children: [
              {
                [Symbol.for('componentType')]: 'Element',
                x: '100',
                y: '$y',
                ':rotation': '$rotate',
              },
            ],
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      const cmp1 = (context.components && context.components['Page']) ||
      component[Symbol.for('components')]['Page']

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig1 = {}
      elementConfig1['w'] = 1920
      elementConfig1['h'] = 1080

      if(typeof cmp1 !== 'undefined') {
        for(let key in cmp1.config.props) {
          delete  elementConfig1[cmp1.config.props[key]]
        }
      }

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]
      const props2 = {}
      props2['w'] = 1920
      props2['h'] = 1080


      if(!elms[2]) {
        const componentType = props2['is'] || 'Page'
        elms[2] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Page not found')})).call(null, {props: props2}, elms[1], component)
        if (elms[2][Symbol.for('slots')][0]) {
          parent = elms[2][Symbol.for('slots')][0]
          component = elms[2]
        } else {
          parent = elms[2][Symbol.for('children')][0]
        }
      }

      if(!elms[3]) {
        elms[3] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig3 = {}

      if(!elms[3].nodeId) {
        elms[3].populate(elementConfig3)
      }
      parent = elms[3]


      if(!elms[4]) {
        elms[4] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig4 = {}
      elementConfig4['x'] = 100
      elementConfig4['y'] = component.y
      if(!elms[4].nodeId) {
        elms[4].populate(elementConfig4)
      }

      return elms
  }
  `

  const expectedEffect1 = `
    function anonymous(component,elms,context) {
      elms[4].set('rotation', component.rotate)
    }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )

  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 1,
    'Generator should return an effects array with 1 item'
  )

  assert.equal(
    normalize(actual.effects[0].toString()),
    normalize(expectedEffect1),
    'Generator should return an effect function for the reactive rotation attribute'
  )

  assert.end()
})

test('Generate code for a template with slot content, using a named slot', (assert) => {
  const scope = {
    components: {
      Page: () => {},
    },
  }

  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Page',
            w: '1920',
            h: '1080',
            children: [
              {
                [Symbol.for('componentType')]: 'Element',
                x: '100',
                y: '$y',
                slot: 'mySlot',
              },
            ],
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      const cmp1 = (context.components && context.components['Page']) ||
      component[Symbol.for('components')]['Page']

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig1 = {}
      elementConfig1['w'] = 1920
      elementConfig1['h'] = 1080

      if(typeof cmp1 !== 'undefined') {
        for(let key in cmp1.config.props) {
          delete  elementConfig1[cmp1.config.props[key]]
        }
      }

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]
      const props2 = {}
      props2['w'] = 1920
      props2['h'] = 1080


      if(!elms[2]) {
        const componentType = props2['is'] || 'Page'
        elms[2] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Page not found')})).call(null, {props: props2}, elms[1], component)
        if (elms[2][Symbol.for('slots')][0]) {
          parent = elms[2][Symbol.for('slots')][0]
          component = elms[2]
        } else {
          parent = elms[2][Symbol.for('children')][0]
        }
      }

      if(!elms[3]) {
        elms[3] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig3 = {}

      if(!elms[3].nodeId) {
        elms[3].populate(elementConfig3)
      }
      parent = elms[3]


      if(!elms[4]) {
        elms[4] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig4 = {}
      elementConfig4['x'] = 100
      elementConfig4['y'] = component.y

      elementConfig4['parent'] = component[Symbol.for('slots')].filter(slot => slot.ref === 'mySlot').shift() || component[Symbol.for('slots')][0] || parent
      elementConfig4['slot'] = "mySlot"

      if(!elms[4].nodeId) {
        elms[4].populate(elementConfig4)
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )

  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )

  assert.end()
})

test('Generate code for a template with a slot', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
            w: '1920',
            h: '1080',
            children: [
              {
                [Symbol.for('componentType')]: 'Slot',
                x: '100',
                y: '$y',
              },
            ],
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig1 = {}
      elementConfig1['w'] = 1920
      elementConfig1['h'] = 1080

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]

      if(!elms[2]) {
        elms[2] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig2 = {}

      elementConfig2[Symbol.for('isSlot')] = true
      elementConfig2['x'] = 100
      elementConfig2['y'] = component.y

      if(!elms[2].nodeId) {
        elms[2].populate(elementConfig2)
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )

  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )

  assert.end()
})

test('Generate code for a template with inline Text', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Text',
            content: 'Hello Blits!',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      const cmp1 = (context.components && context.components['Text']) ||
        component[Symbol.for('components')]['Text']

      parent = elms[0]
      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig1 = {}
      elementConfig1['content'] = 'Hello Blits!'
      if(typeof cmp1 !== 'undefined') {
        for(let key in cmp1.config.props) {
          delete  elementConfig1[cmp1.config.props[key]]
        }
      }

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]
      const props2 = {}
      props2['content'] = 'Hello Blits!'

      if(!elms[2]) {
        const componentType = props2['is'] || 'Text'
        elms[2] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Text not found')})).call(null, {props: props2}, elms[1], component)
        if (elms[2][Symbol.for('slots')][0]) {
          parent = elms[2][Symbol.for('slots')][0]
          component = elms[2]
        } else {
          parent = elms[2][Symbol.for('children')][0]
        }
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with inline dynamic Text', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Text',
            content: '$myText',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      const cmp1 = (context.components && context.components['Text']) ||
        component[Symbol.for('components')]['Text']

      parent = elms[0]
      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig1 = {}
      elementConfig1['content'] = component.myText
      if(typeof cmp1 !== 'undefined') {
        for(let key in cmp1.config.props) {
          delete  elementConfig1[cmp1.config.props[key]]
        }
      }

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]
      const props2 = {}
      props2['content'] = component.myText

      if(!elms[2]) {
        const componentType = props2['is'] || 'Text'
        elms[2] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Text not found')})).call(null, {props: props2}, elms[1], component)
        if (elms[2][Symbol.for('slots')][0]) {
          parent = elms[2][Symbol.for('slots')][0]
          component = elms[2]
        } else {
          parent = elms[2][Symbol.for('children')][0]
        }
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with inline dynamic Text embedded in static text', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Text',
            content: 'Hello {{$firstname}} {{$lastname}}, how are you?',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      const cmp1 = (context.components && context.components['Text']) ||
        component[Symbol.for('components')]['Text']

      parent = elms[0]
      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }

      const elementConfig1 = {}
      elementConfig1['content'] = 'Hello ' + component.firstname + ' ' + component.lastname + ', how are you?'
      if(typeof cmp1 !== 'undefined') {
        for(let key in cmp1.config.props) {
          delete  elementConfig1[cmp1.config.props[key]]
        }
      }

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      parent = elms[1]
      const props2 = {}
      props2['content'] = 'Hello ' + component.firstname + ' ' + component.lastname + ', how are you?'

      if(!elms[2]) {
        const componentType = props2['is'] || 'Text'
        elms[2] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component Text not found')})).call(null, {props: props2}, elms[1], component)
        if (elms[2][Symbol.for('slots')][0]) {
          parent = elms[2][Symbol.for('slots')][0]
          component = elms[2]
        } else {
          parent = elms[2][Symbol.for('children')][0]
        }
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with a single element with attributes with percentages', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        w: '1920',
        h: '1080',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
            w: '50%',
            h: '40%',
            x: '10%',
            y: '20%',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      elementConfig0['w'] = 1920
      elementConfig0['h'] = 1080

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      parent = elms[0]

      if(!elms[1]) {
        elms[1] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig1 = {}

      elementConfig1['w'] = parent.node.width * (50/100)
      elementConfig1['h'] = parent.node.height * (40/100)
      elementConfig1['x'] = parent.node.width * (10/100)
      elementConfig1['y'] = parent.node.height * (20/100)

      if(!elms[1].nodeId) {
        elms[1].populate(elementConfig1)
      }

      return elms
  }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )
  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 0,
    'Generator should return an empty effects array'
  )
  assert.end()
})

test('Generate code for a template with a simple for-loop on an Element', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
            ':for': 'item in $items',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      return elms
  }
  `

  const expectedEffect1 = `
    function anonymous(component,elms,context) {
      parent = elms[0]
      const collection = component.items
      const keys = []
      for(let __index = 0; __index < collection.length; __index++) {
        parent = elms[0]
        if(!component.key) keys.length = 0
        const scope = Object.assign(component, {
          key: Math.random(),
          index: __index,
          item: collection[__index],
        })
        keys.push(scope.key.toString())

        parent = elms[0]
        elms[1] = elms[1] || {}
        if(!elms[1][scope.key]) {
          elms[1][scope.key] = this.element({parent: parent || 'root'}, component)
        }

        const elementConfig1 = {}
        if(!elms[1][scope.key].nodeId) {
          elms[1][scope.key].populate(elementConfig1)
        }
      }
      if(elms[1]) {
        Object.keys(elms[1]).forEach(key => {
          if(keys.indexOf(key) === -1) {
            elms[1][key].delete && elms[1][key].delete()
            elms[1][key].destroy && elms[1][key].destroy()
            delete elms[1][key]
          }
        })
      }
    }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )

  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 1,
    'Generator should return an effects array with 1 function'
  )

  assert.equal(
    normalize(actual.effects[0].toString()),
    normalize(expectedEffect1),
    'Generator should return an effect function for the for loop'
  )

  assert.end()
})

test('Generate code for a template with a simple for-loop on an Element with a custom index key', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
            ':for': '(item, customIndex) in $items',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      return elms
  }
  `

  const expectedEffect1 = `
    function anonymous(component,elms,context) {
      parent = elms[0]
      const collection = component.items
      const keys = []
      for(let __index = 0; __index < collection.length; __index++) {
        parent = elms[0]
        if(!component.key) keys.length = 0
        const scope = Object.assign(component, {
          key: Math.random(),
          customIndex: __index,
          item: collection[__index],
        })
        keys.push(scope.key.toString())

        parent = elms[0]
        elms[1] = elms[1] || {}
        if(!elms[1][scope.key]) {
          elms[1][scope.key] = this.element({parent: parent || 'root'}, component)
        }

        const elementConfig1 = {}
        if(!elms[1][scope.key].nodeId) {
          elms[1][scope.key].populate(elementConfig1)
        }
      }
      if(elms[1]) {
        Object.keys(elms[1]).forEach(key => {
          if(keys.indexOf(key) === -1) {
            elms[1][key].delete && elms[1][key].delete()
            elms[1][key].destroy && elms[1][key].destroy()
            delete elms[1][key]
          }
        })
      }
    }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )

  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 1,
    'Generator should return an effects array with 1 function'
  )

  assert.equal(
    normalize(actual.effects[0].toString()),
    normalize(expectedEffect1),
    'Generator should return an effect function for the for loop'
  )

  assert.end()
})

test('Generate code for a template with a simple for-loop on an Element with a key attribute', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
            ':for': 'item in $items',
            key: 'item.id',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      return elms
  }
  `

  const expectedEffect1 = `
    function anonymous(component,elms,context) {
      parent = elms[0]
      const collection = component.items
      const keys = []
      for(let __index = 0; __index < collection.length; __index++) {
        parent = elms[0]
        if(!component.key) keys.length = 0
        const scope = Object.assign(component, {
          key: Math.random(),
          index: __index,
          item: collection[__index],
        })
        keys.push(item.id)

        parent = elms[0]
        elms[1] = elms[1] || {}
        if(!elms[1][item.id]) {
          elms[1][item.id] = this.element({parent: parent || 'root'}, component)
        }

        const elementConfig1 = {}
        elementConfig1['key'] = "item.id"

        if(!elms[1][item.id].nodeId) {
          elms[1][item.id].populate(elementConfig1)
        }
      }
      if(elms[1]) {
        Object.keys(elms[1]).forEach(key => {
          if(keys.indexOf(key) === -1) {
            elms[1][key].delete && elms[1][key].delete()
            elms[1][key].destroy && elms[1][key].destroy()
            delete elms[1][key]
          }
        })
      }
    }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )

  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 1,
    'Generator should return an effects array with 1 function'
  )

  assert.equal(
    normalize(actual.effects[0].toString()),
    normalize(expectedEffect1),
    'Generator should return an effect function for the for loop'
  )

  assert.end()
})

test('Generate code for a template with a simple for-loop on a Component with a key attribute and a custom index', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'ListItem',
            ':for': '(item, myIndex) in $items',
            key: 'item.id',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      return elms
  }
  `

  const expectedEffect1 = `
    function anonymous(component,elms,context) {
      parent = elms[0]
      const collection = component.items
      const keys = []
      for(let __index = 0; __index < collection.length; __index++) {
        parent = elms[0]
        if(!component.key) keys.length = 0
        const scope = Object.assign(component, {
          key: Math.random(),
          myIndex: __index,
          item: collection[__index],
        })
        keys.push(item.id)

        const cmp1 = (context.components && context.components['ListItem']) ||
        component[Symbol.for('components')]['ListItem']

        elms[1] = elms[1] || {}
        if(!elms[1][item.id]) {
          elms[1][item.id] = this.element({parent: parent || 'root'}, component)
        }

        const elementConfig1 = {}
        elementConfig1['key'] = "item.id"

        if(typeof cmp1 !== 'undefined') {
          for(let key in cmp1.config.props) {
            delete  elementConfig1[cmp1.config.props[key]]
          }
        }

        if(!elms[1][item.id].nodeId) {
          elms[1][item.id].populate(elementConfig1)
        }

        elms[2] = elms[2] || {}
        parent = elms[1][item.id]

        const props2 = {}
        props2['key'] = "item.id"

        if(!elms[2][item.id]) {
          const componentType = props2['is'] || 'ListItem'
          elms[2][item.id] = (context.components && context.components[componentType] || component[Symbol.for('components')][componentType] || (() => { console.error('component ListItem not found')})).call(null, {props: props2}, elms[1][item.id], component)
          if (elms[2][item.id][Symbol.for('slots')][0]) {
            parent = elms[2][item.id][Symbol.for('slots')][0]
            component = elms[2][item.id]
          } else {
            parent = elms[2][item.id][Symbol.for('children')][0]
          }
        }
      }
      if(elms[2]) {
        Object.keys(elms[2]).forEach(key => {
          if(keys.indexOf(key) === -1) {
            elms[2][key].delete && elms[2][key].delete()
            elms[2][key].destroy && elms[2][key].destroy()
            delete elms[2][key]
          }
        })
      }
    }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )

  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 1,
    'Generator should return an effects array with 1 function'
  )

  assert.equal(
    normalize(actual.effects[0].toString()),
    normalize(expectedEffect1),
    'Generator should return an effect function for the for loop'
  )

  assert.end()
})

test('Generate code for a template with a simple for-loop on an Element with an automatic ref attribute', (assert) => {
  const templateObject = {
    children: [
      {
        [Symbol.for('componentType')]: 'Element',
        children: [
          {
            [Symbol.for('componentType')]: 'Element',
            ':for': 'item in $items',
            key: 'item.id',
            ref: 'myref',
          },
        ],
      },
    ],
  }

  const expectedRender = `
  function anonymous(parent,component,context) {
      const elms = []

      if(!elms[0]) {
        elms[0] = this.element({parent: parent || 'root'}, component)
      }
      const elementConfig0 = {}

      if(!elms[0].nodeId) {
        elms[0].populate(elementConfig0)
      }

      return elms
  }
  `

  const expectedEffect1 = `
    function anonymous(component,elms,context) {
      parent = elms[0]
      const collection = component.items
      const keys = []
      for(let __index = 0; __index < collection.length; __index++) {
        parent = elms[0]
        if(!component.key) keys.length = 0
        const scope = Object.assign(component, {
          key: Math.random(),
          index: __index,
          item: collection[__index],
          __ref: 'myref'+__index
        })
        keys.push(item.id)

        parent = elms[0]
        elms[1] = elms[1] || {}
        if(!elms[1][item.id]) {
          elms[1][item.id] = this.element({parent: parent || 'root'}, component)
        }

        const elementConfig1 = {}
        elementConfig1['key'] = "item.id"
        elementConfig1['ref'] = scope.__ref

        if(!elms[1][item.id].nodeId) {
          elms[1][item.id].populate(elementConfig1)
        }
      }
      if(elms[1]) {
        Object.keys(elms[1]).forEach(key => {
          if(keys.indexOf(key) === -1) {
            elms[1][key].delete && elms[1][key].delete()
            elms[1][key].destroy && elms[1][key].destroy()
            delete elms[1][key]
          }
        })
      }
    }
  `

  const actual = generator.call(scope, templateObject)

  assert.equal(
    normalize(actual.render.toString()),
    normalize(expectedRender),
    'Generator should return a render function with the correct code'
  )

  assert.ok(
    Array.isArray(actual.effects) && actual.effects.length === 1,
    'Generator should return an effects array with 1 function'
  )

  assert.equal(
    normalize(actual.effects[0].toString()),
    normalize(expectedEffect1),
    'Generator should return an effect function for the for loop'
  )

  assert.end()
})
