import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReasoningProcess from './index'

describe('ReasoningProcess Component', () => {
  it('should not render when no reasoning and not loading', () => {
    const { container } = render(<ReasoningProcess reasoning="" isLast={false} hasContent={true} />)
    expect(container.firstChild).toBeNull()
  })

  it('should show "thinking" state when loading and no content', () => {
    render(<ReasoningProcess reasoning="" isLast={true} hasContent={false} />)
    expect(screen.getByText(/正在思考/i)).toBeInTheDocument()
  })

  it('should show reasoning content and word count', () => {
    const content = 'This is a test reasoning.'
    render(<ReasoningProcess reasoning={content} isLast={false} hasContent={true} />)
    expect(screen.getByText(new RegExp(`已思考 ${content.length} 字`, 'i'))).toBeInTheDocument()
    expect(screen.getByText(content)).toBeInTheDocument()
  })

  it('should toggle content visibility when clicked', () => {
    const content = 'This is a test reasoning.'
    render(<ReasoningProcess reasoning={content} isLast={false} hasContent={true} />)
    
    const toggleBtn = screen.getByRole('button')
    
    // Initial state: expanded (defined by useState(true) in component)
    expect(screen.getByText(content)).toBeInTheDocument()
    
    // Click to collapse
    fireEvent.click(toggleBtn)
    expect(screen.queryByText(content)).not.toBeInTheDocument()
    
    // Click to expand again
    fireEvent.click(toggleBtn)
    expect(screen.getByText(content)).toBeInTheDocument()
  })
})
