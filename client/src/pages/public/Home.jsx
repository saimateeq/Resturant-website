import Hero from '@components/home/Hero';
import Intro from '@components/home/Intro';
import PersonalizedSection from '@components/home/PersonalizedSection';
import FeaturedDishes from '@components/home/FeaturedDishes';
import PopularCategories from '@components/home/PopularCategories';
import WhyChooseUs from '@components/home/WhyChooseUs';
import MeetChefs from '@components/home/MeetChefs';
import Testimonials from '@components/home/Testimonials';
import FoodGallery from '@components/home/FoodGallery';
import SpecialOffers from '@components/home/SpecialOffers';
import Newsletter from '@components/home/Newsletter';
import ContactTeaser from '@components/home/ContactTeaser';
import { useSEO } from '@hooks/useSEO';

export default function Home() {
  useSEO({
    description:
      'Savoria is a premium fine-dining restaurant. Browse our menu, reserve a table, and order online for pickup or delivery.',
  });

  return (
    <>
      <Hero />
      <Intro />
      <PersonalizedSection />
      <FeaturedDishes />
      <PopularCategories />
      <WhyChooseUs />
      <MeetChefs />
      <Testimonials />
      <FoodGallery />
      <SpecialOffers />
      <Newsletter />
      <ContactTeaser />
    </>
  );
}
