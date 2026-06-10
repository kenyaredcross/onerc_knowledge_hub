import { useState, useMemo } from "react";
import { HelpCircle, Plus, Minus, Mail, Phone, MessageCircle, Filter } from "lucide-react";
import { useFrappeGetCall } from "frappe-react-sdk";
import { useTranslation } from 'react-i18next';

interface FAQ {
  name: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

interface FAQCategory {
  name: string;
  category_name: string;
  description: string;
  sort_order: number;
}

export default function FAQs() {
  const { t } = useTranslation(['faqs', 'common']);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Fetch FAQ categories
  const { data: categoriesData } = useFrappeGetCall<{ message: FAQCategory[] }>(
    "onerc_core.api.faq.get_faq_categories",
    {}
  );

  // Fetch all FAQs
  const { data: faqsData } = useFrappeGetCall<{ message: FAQ[] }>(
    "onerc_core.api.faq.get_faq_list",
    {}
  );

  // Get all categories for filter buttons
  const categories = useMemo(() => {
    return categoriesData?.message || [];
  }, [categoriesData]);

  // Group FAQs by category
  const faqs = useMemo(() => {
    const cats = categoriesData?.message || [];
    const allFaqs = faqsData?.message || [];

    return cats.map(cat => ({
      category: cat.category_name,
      categoryId: cat.name,
      questions: allFaqs
        .filter(faq => faq.category === cat.name)
        .map(faq => ({
          question: faq.question,
          answer: faq.answer
        }))
    })).filter(cat => cat.questions.length > 0); // Only show categories with FAQs
  }, [categoriesData, faqsData]);

  // Filter FAQs based on selected category
  const filteredFaqs = useMemo(() => {
    if (selectedCategory === "All") {
      return faqs;
    }
    return faqs.filter(cat => cat.categoryId === selectedCategory);
  }, [faqs, selectedCategory]);

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white shadow-lg">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            {t('faqs:pageTitle')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('faqs:pageSubtitle')}
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{t('faqs:filterByCategory')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === "All"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t('faqs:allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat.name
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs by Category */}
      <div className="space-y-6">
        {filteredFaqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <h2 className="font-display text-xl font-bold text-gray-900">
                {category.category}
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {category.questions.map((faq, faqIndex) => {
                const globalIndex = categoryIndex * 100 + faqIndex;
                const isOpen = openFaqIndex === globalIndex;
                return (
                  <div
                    key={faqIndex}
                    className="overflow-hidden rounded-lg bg-white border border-gray-200 transition-all hover:shadow-md"
                  >
                    <button
                      onClick={() => toggleFaq(globalIndex)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                          isOpen
                            ? "bg-orange-100 text-orange-600 rotate-180"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isOpen ? (
                          <Minus className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      <div className="px-5 pb-5 pt-0">
                        <div
                          className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-dash-navy to-blue-900 rounded-lg p-8 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold mb-2">
              {t('faqs:stillNeedHelp')}
            </h3>
            <p className="text-blue-200 mb-4">
              {t('faqs:supportDescription')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:support@localisationhub.org"
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-800 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <Mail className="h-4 w-4" />
                {t('faqs:emailSupport')}
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium border border-white/30"
              >
                <Phone className="h-4 w-4" />
                {t('faqs:callUs')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
