import { ComponentType, Suspense } from 'react'

// project imports
import Loader from './Loader'

// ==============================|| LOADABLE - LAZY LOADING ||============================== //

export const Loadable = <P extends object>(Component: ComponentType<P>) =>
    function WithLoader(props: P) {
        return (
            <Suspense fallback={<Loader />}>
                <Component {...props} />
            </Suspense>
        )
    }

export default Loadable
