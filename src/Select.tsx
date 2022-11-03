import { useEffect, useRef, useState } from 'react'
import styles from './select.module.css'

export type SelectOptions = {
    label: string
    value:string | number
}

type MultipleSelectedProps = {
    multiple: true
    value: SelectOptions[]
    onChange: (value:SelectOptions[])=> void
}

type SingleSelectedProps = {
    multiple?: false
    value?: SelectOptions
    onChange: (value:SelectOptions | undefined)=> void
}

type SelectProps = {
   options: SelectOptions[]
} & (SingleSelectedProps | MultipleSelectedProps)

export function Select({multiple, value, onChange, options}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    function clearOptions() {
        multiple ? onChange([]) : onChange(undefined)
    }

    function selectOption(option: SelectOptions){
        if (multiple) {
            if(value?.includes(option)) {
                onChange(value.filter(o => o !== option))            
            } else {
                onChange([...value, option])            
            }
        } else {
            if(option !== value)  onChange(option)
        }
    }

    function isOptionSelected(option:SelectOptions) {
        return multiple ? value?.includes(option) : option === value
    }

    useEffect(() => {
      if(isOpen) setHighlightedIndex(0)
    }, [isOpen])
    
   useEffect(() => {
     const handler = (e: KeyboardEvent) => {
        if (e.target != containerRef.current) return
        switch (e.code) {
            case "Enter":
            case "Space":
                setIsOpen(!isOpen)
                if(isOpen) selectOption(options[highlightedIndex])
                break;
            case "ArrowUp":
            case "ArrowDown": {
                if(!isOpen)  {
                    setIsOpen(true)
                    break 
                }
                const newValue = highlightedIndex + (e.code === "ArrowDown" ? 1 : -1)
                if(newValue >= 0 && newValue < options.length) {
                    setHighlightedIndex(newValue)
                }
                break
            }
            case "Escape":
                setIsOpen(false)
                break
            default:
                break;
        }
     }
     containerRef.current?.addEventListener("keydown", handler)
    
     return () => {
       containerRef.current?.removeEventListener("keydown", handler)
     }
   }, [isOpen, highlightedIndex, options])
   
    return (
        <div 
            ref={containerRef}
            tabIndex={0}
            onBlur={()=>setIsOpen(false)}
            onClick={()=> setIsOpen(!isOpen)} 
            className={styles.container}>
            <span className={styles.value}>{multiple ? value?.map(v => (
                <button key={v.value} className={styles["option-badge"]} onClick={e => {
                    e.stopPropagation()
                    selectOption(v)
                }}>{v.label} <span className={styles["remove-btn"]}>&times;</span></button>
            )) : value?.label}</span>
            <button onClick={(e) => {
                e.stopPropagation()
                clearOptions()
            }} className={styles["clear-btn"]}>&times;</button>
            <div className={styles.divider}></div>
            <div className={styles.caret}></div>
            <ul className={`${styles.options} ${isOpen ? styles.show: ""}`}>
                {options.map((option, index) => {
                    return <li onClick={(e) => {
                        e.stopPropagation()
                        selectOption(option)
                        setIsOpen(false)
                    }} 
                    onMouseEnter={() => setHighlightedIndex(index)} key={option.value} 
                    className={`${styles.option} ${isOptionSelected(option) ? styles.selected : ""} ${highlightedIndex === index ? styles.highlighted : ""}`}>{option.label}</li>
                })}
            </ul>
        </div>
    )
}