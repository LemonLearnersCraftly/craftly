import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import {
  Heart,
  Bookmark,
  Share2,
  Users,
  MessageCircle,
  Palette,
  BookOpen,
  Award,
  ImageIcon,
  SyringeIcon as Needle,
  PenTool,
} from "lucide-react";
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";

// all url routes to / will display this component

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-custom-lavender">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container px-4 md:px-6 py-12 md:py-24 lg:py-32">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-custom-sage">
                  Craft, Connect, Create Together
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Join a vibrant community of crafters where creativity knows no
                  bounds. Share your DIY projects, discover inspiration, and
                  connect with fellow artisans.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  size="lg"
                  className="bg-custom-mint hover:bg-custom-sage text-white"
                >
                  Start Creating
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-custom-purple text-custom-purple hover:bg-custom-purple hover:text-white"
                >
                  Explore Projects
                </Button>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-2">
              {[
                {
                  alt: "Knitting project",
                  src: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&h=400&q=80",
                },
                {
                  alt: "Pottery creation",
                  src: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=400&h=400&q=80",
                },
                {
                  alt: "Painting artwork",
                  src: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&q=80",
                },
                {
                  alt: "DIY project",
                  src: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=400&q=80",
                },
              ].map((image, i) => (
                <div
                  key={i}
                  className="relative group overflow-hidden rounded-xl"
                >
                  <img
                    alt={image.alt}
                    className="object-cover w-full aspect-square transform transition-transform group-hover:scale-105"
                    src={image.src || "/placeholder.svg"}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container px-4 md:px-6 py-12 md:py-24 lg:py-32 bg-white">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-custom-sage">
              Your Creative Journey Starts Here
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl">
              Everything you need to share your craft and connect with fellow
              creators.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ImageIcon,
                title: "Share Your Creations",
                description:
                  "Post photos of your latest projects and get inspired by others' work.",
              },
              {
                icon: Users,
                title: "Connect with Crafters",
                description:
                  "Follow other crafters, join communities, and build your creative network.",
              },
              {
                icon: Award,
                title: "Earn Badges",
                description:
                  "Show off your expertise with specialty badges for different craft types.",
              },
              {
                icon: BookOpen,
                title: "Discover Articles",
                description:
                  "Stay updated with curated articles based on your interests.",
              },
              {
                icon: Bookmark,
                title: "Save Inspiration",
                description:
                  "Bookmark your favorite posts and organize them into collections.",
              },
              {
                icon: MessageCircle,
                title: "Engage & Discuss",
                description:
                  "Comment on posts and participate in craft-related discussions.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-custom-lavender"
              >
                <div className="rounded-full bg-white p-4">
                  <feature.icon className="h-6 w-6 text-custom-mint" />
                </div>
                <h3 className="text-xl font-bold text-custom-sage">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Preview Section */}
        <section className="container px-4 md:px-6 py-12 md:py-24 lg:py-32">
          <div className="relative">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-custom-sage">
                Your Creative Space
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl">
                A personalized feed of inspiration and creativity.
              </p>
            </div>

            <div className="mx-auto max-w-5xl rounded-xl border bg-white shadow-2xl">
              <div className="grid md:grid-cols-[1fr_2fr_1fr] gap-6 p-6">
                {/* Profile Section */}
                <div className="space-y-4 p-4 rounded-lg bg-custom-lavender">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative flex w-full flex-col items-center justify-center p-5">
                      <OrbitingCircles
                        radius={80}
                        iconSize={40}
                        centerComponent={
                          <img
                            alt="Profile"
                            className="rounded-full w-20 h-20 object-cover"
                            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&q=90"
                          />
                        }
                      >
                        {/* Wrapped Icons in a Background Container */}
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary">
                          <Needle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary">
                          <PenTool className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-700">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                      </OrbitingCircles>
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-custom-sage">
                        Emma Thompson
                      </h3>
                      <p className="text-sm text-gray-600 font-mono">
                        @crafty_emma
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Passionate crafter sharing my journey through knitting,
                        painting, and DIY projects. Love to experiment with
                        colors and textures! 🎨✨
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <div className="text-center">
                        <p className="font-black">Following</p>
                        <p className="font-semibold text-custom-sage">1.2k</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black">Followers</p>
                        <p className="font-semibold text-custom-sage">3.5k</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        { text: "Knitting", color: "bg-primary" },
                        { text: "Painting", color: "bg-secondary" },
                        { text: "DIY", color: "bg-purple-700" },
                      ].map((tag, i) => (
                        <span
                          key={tag.text}
                          className={`px-2 py-1 rounded-full ${tag.color} text-white text-sm`}
                        >
                          {tag.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feed Preview */}
                <div className="space-y-6">
                  <div className="rounded-lg border bg-white p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        alt="User"
                        className="rounded-full w-10 h-10 object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&q=90"
                      />
                      <div>
                        <p className="font-semibold text-custom-sage">
                          Sophie's Crafts
                        </p>
                        <p className="text-sm text-gray-600">
                          Crochet Enthusiast
                        </p>
                      </div>
                    </div>
                    <img
                      alt="Crochet project"
                      className="rounded-lg w-full aspect-square object-cover mb-4"
                      src="https://images.unsplash.com/photo-1632649027900-389e810204e6?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Just finished this cozy blanket! 🧶 Love how the colors
                        turned out. What do you think? #crochet #handmade #cozy
                      </p>
                      <div className="flex items-center gap-4">
                        {[
                          { icon: Heart, text: "234", color: "pink" },
                          {
                            icon: MessageCircle,
                            text: "42",
                            color: "purple",
                          },
                          { icon: Bookmark, color: "sage" },
                          { icon: Share2, color: "sage" },
                        ].map((action, i) => (
                          <Button
                            key={i}
                            size="icon"
                            className={`flex items-center justify-center gap-1 text-black bg-white py-2 px-8 hover:bg-custom-lavender`}
                          >
                            <action.icon className="h-5 w-5" />
                            {action.text && (
                              <span className="ml-1 text-xs">
                                {action.text}
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Articles Preview */}
                <div className="space-y-4 p-4 rounded-lg bg-custom-lavender">
                  <h4 className="font-semibold text-custom-sage">
                    Trending Articles
                  </h4>
                  <div className="space-y-4">
                    {[
                      {
                        image:
                          "https://images.unsplash.com/photo-1610177498701-4f00c0bd1694?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                        title: "10 Essential Knitting Tips for Beginners",
                        readTime: "5 min read",
                        author: "Craft Expert",
                      },
                      {
                        image:
                          "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=48&h=48&q=90",
                        title: "DIY Home Decor Ideas for Spring",
                        readTime: "7 min read",
                        author: "Home & Craft",
                      },
                      {
                        image:
                          "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=48&h=48&q=90",
                        title: "Getting Started with Pottery",
                        readTime: "10 min read",
                        author: "Ceramic Arts",
                      },
                    ].map((article, i) => (
                      <div className="bg-white rounded-lg">
                        <div
                          key={i}
                          className="flex items-start space-x-3  p-3 "
                        >
                          <img
                            alt={article.title}
                            className="rounded w-12 h-12 object-cover"
                            src={article.image || "/placeholder.svg"}
                          />
                          <div>
                            <p className="text-sm font-medium text-custom-sage">
                              {article.title}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 pl-3 pb-2">
                          {article.readTime} • By {article.author}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container px-4 md:px-6 py-12 md:py-24 lg:py-20 bg-white">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-custom-sage">
              Join Our Creative Community
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-600 mt-4 md:text-xl">
              Connect with fellow crafters, share your creations, and get
              inspired by amazing artists from around the world.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-custom-mint hover:bg-custom-sage text-white"
            >
              Join Craftly Today
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
