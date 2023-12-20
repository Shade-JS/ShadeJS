export default (component) => {
    console.log(component)
    console.log(component.style.call(component, component))
    console.log(component.template.call(component, component))
}