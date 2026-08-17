import Hero from '@components/home/Hero';
import SignatureDish from '@components/home/SignatureDish';
import Intro from '@components/home/Intro';
import FeaturedDishes from '@components/home/FeaturedDishes';
import PersonalizedSection from '@components/home/PersonalizedSection';
import PopularCategories from '@components/home/PopularCategories';
import MeetChefs from '@components/home/MeetChefs';
import WhyChooseUs from '@components/home/WhyChooseUs';
import Space from '@components/home/Space';
import Testimonials from '@components/home/Testimonials';
import FullBleedMoment from '@components/home/FullBleedMoment';
import FoodGallery from '@components/home/FoodGallery';
import SpecialOffers from '@components/home/SpecialOffers';
import InstagramStrip from '@components/home/InstagramStrip';
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
      <SignatureDish />
      <Intro />
      <FeaturedDishes />
      <PersonalizedSection />
      <PopularCategories />
      <MeetChefs />
      <WhyChooseUs />
      <Space />
      <Testimonials />
      <FullBleedMoment />
      <FoodGallery />
      <SpecialOffers />
      <InstagramStrip />
      <Newsletter />
      <ContactTeaser />
    </>
  );
}
