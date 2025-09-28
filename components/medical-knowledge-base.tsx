"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Heart,
  Brain,
  Stethoscope,
  Activity,
  Eye,
  Bone,
  Pill,
  ChevronRight,
  Clock,
} from "lucide-react";

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  lastUpdated: string;
  readTime: string;
  tags: string[];
}

const CATEGORIES = [
  { id: "cardiology", name: "Cardiology", icon: Heart, color: "text-red-500" },
  { id: "neurology", name: "Neurology", icon: Brain, color: "text-purple-500" },
  {
    id: "general",
    name: "General Medicine",
    icon: Stethoscope,
    color: "text-emerald-500",
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    icon: Bone,
    color: "text-blue-500",
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology",
    icon: Eye,
    color: "text-teal-500",
  },
  {
    id: "pharmacology",
    name: "Pharmacology",
    icon: Pill,
    color: "text-orange-500",
  },
];

const SAMPLE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "1",
    title: "Understanding Hypertension: Causes, Symptoms, and Treatment",
    category: "cardiology",
    summary:
      "Comprehensive guide to high blood pressure management and prevention strategies.",
    content:
      "Hypertension, commonly known as high blood pressure, affects millions worldwide...",
    lastUpdated: "2024-01-15",
    readTime: "8 min",
    tags: ["hypertension", "cardiovascular", "prevention"],
  },
  {
    id: "2",
    title: "Migraine Management: Modern Approaches to Treatment",
    category: "neurology",
    summary:
      "Latest evidence-based treatments for migraine prevention and acute management.",
    content:
      "Migraines are complex neurological disorders that require comprehensive treatment...",
    lastUpdated: "2024-01-12",
    readTime: "6 min",
    tags: ["migraine", "headache", "neurology"],
  },
  {
    id: "3",
    title: "Diabetes Type 2: Lifestyle Interventions and Medication",
    category: "general",
    summary:
      "Evidence-based approach to managing type 2 diabetes through lifestyle and medication.",
    content:
      "Type 2 diabetes management requires a multifaceted approach combining lifestyle modifications...",
    lastUpdated: "2024-01-10",
    readTime: "10 min",
    tags: ["diabetes", "lifestyle", "medication"],
  },
  {
    id: "4",
    title: "Common Drug Interactions in Primary Care",
    category: "pharmacology",
    summary:
      "Essential guide to identifying and managing drug interactions in clinical practice.",
    content:
      "Drug interactions are a significant concern in clinical practice, especially in patients...",
    lastUpdated: "2024-01-08",
    readTime: "12 min",
    tags: ["drug interactions", "pharmacology", "safety"],
  },
];

export function MedicalKnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] =
    useState<KnowledgeArticle | null>(null);

  const filteredArticles = SAMPLE_ARTICLES.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find((cat) => cat.id === categoryId);
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedArticle(null)}
          className="mb-6 text-emerald-600 hover:text-emerald-800"
        >
          ← Back to Knowledge Base
        </Button>

        <article className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(() => {
                const category = getCategoryInfo(selectedArticle.category);
                const Icon = category?.icon || BookOpen;
                return (
                  <Icon
                    className={`w-5 h-5 ${
                      category?.color || "text-emerald-500"
                    }`}
                  />
                );
              })()}
              <Badge variant="outline">
                {getCategoryInfo(selectedArticle.category)?.name ||
                  selectedArticle.category}
              </Badge>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {selectedArticle.readTime} read
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              {selectedArticle.title}
            </h1>

            <p className="text-lg text-gray-600">{selectedArticle.summary}</p>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last updated:{" "}
                {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedArticle.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="prose max-w-none">
            <div className="bg-white rounded-lg border p-6">
              <p className="text-gray-700 leading-relaxed">
                {selectedArticle.content}
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Medical Disclaimer:</strong> This information is for
                  educational purposes only and should not replace professional
                  medical advice. Always consult with a qualified healthcare
                  provider for diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Medical Knowledge Base
        </h1>
        <p className="text-emerald-600">
          Evidence-based medical information and clinical guidelines
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search medical topics, conditions, treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Medical Specialties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setSelectedCategory(null)}
            >
              <Activity className="w-6 h-6" />
              <span className="text-xs">All Topics</span>
            </Button>
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className={`w-6 h-6 ${category.color}`} />
                  <span className="text-xs">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <AnimatePresence>
          {filteredArticles.map((article, index) => {
            const category = getCategoryInfo(article.category);
            const Icon = category?.icon || BookOpen;

            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent
                    className="p-6"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`w-5 h-5 ${
                              category?.color || "text-emerald-500"
                            }`}
                          />
                          <Badge variant="outline" className="text-xs">
                            {category?.name || article.category}
                          </Badge>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">
                            {article.readTime}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-gray-600 text-sm leading-relaxed">
                          {article.summary}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(article.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors ml-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No articles found matching your search criteria.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search terms or category filter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
