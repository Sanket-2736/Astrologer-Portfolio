import HeroSection from '@/components/home/HeroSection'
import ServicesOverview from '@/components/home/ServicesOverview'
import FeaturedTestimonials from '@/components/home/FeaturedTestimonials'
import TrustBadges from '@/components/home/TrustBadges'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <ServicesOverview />
      <FeaturedTestimonials />
    </>
  )
}
