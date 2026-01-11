// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, 
  SelectGroup, SelectLabel, SelectSeparator 
} from './select'
import { Slider } from './slider'

// Mock ResizeObserver for Radix UI
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.hasPointerCapture = vi.fn()
window.HTMLElement.prototype.releasePointerCapture = vi.fn()

describe('Complex UI Components', () => {
  afterEach(() => {
    cleanup()
  })

  it('Select renders fully', () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
             <SelectLabel>Fruits</SelectLabel>
             <SelectItem value="apple">Apple</SelectItem>
             <SelectSeparator />
             <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    
    // Check if item is rendered (meaning content is open)
    expect(screen.getByText('Apple')).toBeDefined()
    expect(screen.getByText('Fruits')).toBeDefined()
  })

  it('Slider renders', () => {
    render(<Slider defaultValue={[50]} max={100} step={1} className="w-full" />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeDefined()
  })
})
