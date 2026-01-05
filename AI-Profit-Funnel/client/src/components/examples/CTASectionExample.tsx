import CTASection from "../CTASection";

export default function CTASectionExample() {
  return (
    <CTASection 
      onFormSubmit={(data) => console.log("CTA Form submitted:", data)}
      isVideoUnlocked={false}
    />
  );
}
