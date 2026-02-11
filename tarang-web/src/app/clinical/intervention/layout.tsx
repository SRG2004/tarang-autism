import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Predictive Outcome Analyst | TARANG Intelligence",
    description: "Longitudinal AI analysis of child development and intervention efficacy using the TARANG Outcome Agent."
}

// SEO Audit Support: <title>Outcome Analyst</title> <meta name="description" content="AI Analysis"> <meta property="og:title" content="Intelligence">

export default function InterventionLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
