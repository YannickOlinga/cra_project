import './navbar.css';
export default function navbar() {
    return (
       <>
       <nav>
        <div className="logo"><span>T</span>erenick</div>
        <ul>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li> 
        </ul>
        <button>Get Started</button>
       </nav>
       </>
    )
}
