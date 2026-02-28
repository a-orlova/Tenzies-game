import { useState, useRef, useEffect } from "react"
import Die from "./Die"
import { nanoid } from "nanoid"
import Confetti from "react-confetti"

export default function App() {
    const mainRef = useRef(null)
    const [dice, setDice] = useState(() => generateAllNewDice())
    const [rollCount, setRollCount] = useState(0)
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [bestRolls, setBestRolls] = useState(() => {
        if (localStorage.getItem('bestRolls')) {
            return JSON.parse(localStorage.getItem('bestRolls'))
        }
        else {
            return null
        }
    })
    const [bestTime, setBestTime] = useState(() => {
        if (localStorage.getItem('bestTime')) {
            return JSON.parse(localStorage.getItem('bestTime'))
        }
        else {
            return null
        }
    })
    const buttonRef = useRef(null)

    const gameWon = dice.every(die => die.isHeld) &&
        dice.every(die => die.value === dice[0].value)
        
    useEffect(() => {
        if (gameWon) {
            buttonRef.current.focus()

            const newBestTime = bestTime === null ? time : Math.min(bestTime, time)
            setBestTime(newBestTime)
            localStorage.setItem("bestTime", JSON.stringify(newBestTime))

            const newBest = bestRolls === null ? rollCount : Math.min(bestRolls, rollCount)
            setBestRolls(newBest)
            setIsRunning(false)
            
            localStorage.setItem('bestRolls', JSON.stringify(newBest))
        }
    }, [gameWon])

    useEffect(() => {
        if (rollCount === 1 && !gameWon) {
            setIsRunning(true)
        }

    }, [rollCount, gameWon])

    useEffect(() => {
        if (!isRunning) return

        const intervalId = setInterval(() => {
            setTime(prevTime => prevTime + 10)
        }, 10)

        return () => clearInterval(intervalId)
    }, [isRunning])

    function generateAllNewDice() {
        return new Array(10)
            .fill(0)
            .map(() => ({
                value: Math.ceil(Math.random() * 6),
                isHeld: false,
                id: nanoid()
            }))
    }
    
    function rollDice() {
        if (!gameWon) {
            setRollCount(prevRollCount => prevRollCount + 1)
            setDice(oldDice => oldDice.map(die =>
                die.isHeld ?
                    die :
                    { ...die, value: Math.ceil(Math.random() * 6) }
            ))
        } else {
            setTime(0)
            setIsRunning(false)
            setRollCount(0)
            setDice(generateAllNewDice())
        }
    }

    function hold(id) {
        setDice(oldDice => oldDice.map(die =>
            die.id === id ?
                { ...die, isHeld: !die.isHeld } :
                die
        ))
    }

    const diceElements = dice.map(dieObj => (
        <Die
            key={dieObj.id}
            value={dieObj.value}
            isHeld={dieObj.isHeld}
            hold={() => hold(dieObj.id)}
        />
    ))

    return (
        <main ref={mainRef}>
            {gameWon && mainRef.current && (
                <Confetti 
                    width={mainRef.current.clientWidth}
                    height={mainRef.current.clientHeight}
                    numberOfPieces={200}
                    gravity={0.3}
                    recycle={false}
                />)}
            <div aria-live="polite" className="sr-only">
                {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
            </div>
            <p id="time-el">Time: {Math.floor(time / 1000)}:{(Math.floor((time % 1000) / 10)).toString().padStart(2, "0")}s</p>
            <p id="best-time-el">Best Time: {bestTime !== null ? `${Math.floor(bestTime/1000)}:${Math.floor((bestTime%1000)/10).toString().padStart(2,"0")}s`: "-"}</p>
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <div className="records">
                <p>Rolls: {rollCount}</p>
                <button ref={buttonRef} className="roll-dice" onClick={rollDice}>
                    {gameWon ? "New Game" : "Roll"}
                </button>
                <p>Best: {bestRolls ?? "-"}</p>
            </div>
        </main>
    )
}