<p align="center"><img width="555px" src="docs/images/shadejs-logo-tiny.png" alt="ShadeJS - Web Development The East Way/></p>

# ShadeJS  🌴


> Web Development - _The Easy Way_


## Follow The Series

ShadeJS is a blog post series on developing a **SPA Framework built on Modular JavaScript, NodeJS and Closed-Shadow Web Components**.


- [Part 1 - Burn It All Down!](https://dev.to/f1lt3r/build-a-spa-framework-1-4jld) &mdash; What I hate about Web Dev and what to do about it.
- [Part 2 - The Magic HTTP Server](https://dev.to/f1lt3r/build-a-spa-framework-1-4jld) &mdash; A server that allows extension-less file imports.


## Basic ShadeJS Component 

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