import React from 'react'
import { Link } from 'react-router-dom'

import '../styles/Home.css';

export default function Home() {

    return (

            <div className="home-main">
                <h1 className="title">Yoga AI Trainer</h1>
                <div className="btn-section">
                    <Link to='/ai-trainer/yoga'>
                        <button
                            className="btn start-btn"
                        >Let's Start</button>
                    </Link>

                </div>
            </div>
    )
}
