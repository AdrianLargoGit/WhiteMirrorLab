'use client'

import { useEffect } from 'react'

export default function RevealOnScroll() {
  useEffect(() => {
    let observer: IntersectionObserver | undefined
    const id = setTimeout(() => {
      const els = document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)')
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              observer?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      )
      els.forEach((el) => observer?.observe(el))
    }, 50)
    return () => { clearTimeout(id); observer?.disconnect() }
  }, [])

  return null
}
