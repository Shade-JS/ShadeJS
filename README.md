![Shade JS Palm Tree Graphic](docs/images/shadejs-logo-micro.png)

# ShadeJS  🌴

> Modular JavaScript SPA framework built on closed-shadow Web Components.

## Follow The Series

- [Part 1 - Concept](https://dev.to/f1lt3r/build-a-spa-framework-1-4jld)
- [Part 2 - Server](https://dev.to/f1lt3r/build-a-spa-framework-1-4jld)


## Simple ShadeJS Component 

```javascript
import Shade, {css, html} from '/vendor/Shade'

class MyCounter extends HTMLElement {
    title = 'My Awesome Counter'
    count = 0

    style = ({count}) => css`
        h1 {
            color: ${count >= 8 ? 'red' : 'green'};
        }
        p {
            border: 1px dotted black;
            padding: 1rem;
        }
    `

    template = ({title, count}) => html`
        <div>
            <h1>${title}</h1>
            <p>${count}</p>
            <button @click="subtract(1)">Subtract 1</button>
            <button @click="add(1 + 1)">Add 2</button>
        </div>
    `

    constructor() {
        super()
        Shade(this)
    }

    add(amount) {
        this.count += amount
    }

    subtract(amount) {
        this.count -= amount
    }
}

window.customElements.define('my-counter', MyCounter)
```