import HeroSection from "../HeroSection";

export default function HeroSectionExample() {
  return (
    <HeroSection 
      onFormSubmit={(data) => console.log("Form submitted:", data)}
      isVideoUnlocked={false}
    />
  );
}
