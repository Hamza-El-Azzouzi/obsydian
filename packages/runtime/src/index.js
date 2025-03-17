import { o } from "./o.js";
const element = o(
    "h1",
    {class:"title"},
    ["obsydian"]
)
console.log(element)
const container = document.getElementById("root");
container.append(element)