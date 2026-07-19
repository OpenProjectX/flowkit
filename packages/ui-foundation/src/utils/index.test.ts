import { debounce } from './index'

describe('debounce', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('delays invocation until the wait has elapsed', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 500)
        debounced()
        expect(fn).not.toHaveBeenCalled()
        jest.advanceTimersByTime(500)
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('only invokes once for a burst of calls', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 500)
        debounced()
        debounced()
        debounced()
        jest.advanceTimersByTime(500)
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('resets the timer on every call', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 500)
        debounced()
        jest.advanceTimersByTime(400)
        debounced()
        jest.advanceTimersByTime(400)
        expect(fn).not.toHaveBeenCalled()
        jest.advanceTimersByTime(100)
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('invokes with the arguments of the last call', () => {
        const fn = jest.fn()
        const debounced = debounce(fn, 500)
        debounced('first')
        debounced('last', 42)
        jest.advanceTimersByTime(500)
        expect(fn).toHaveBeenCalledWith('last', 42)
    })
})
