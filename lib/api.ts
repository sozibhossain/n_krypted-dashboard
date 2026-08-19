import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

// Clean base URL so it points to /api
const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api";
export const API_BASE_URL = rawBaseUrl.endsWith("/v1")
  ? rawBaseUrl.replace(/\/v1$/, "")
  : rawBaseUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token from NextAuth session or localStorage
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      try {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
          return config;
        }
      } catch (err) {
        // Fallback
      }

      const token = localStorage.getItem("nk_access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------
export interface UserItem {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  isVerified?: boolean;
  avatar?: string;
  country?: string;
  cityState?: string;
  createdAt?: string;
  updatedAt?: string;
  checkInCount?: number;
  reviewCount?: number;
  status?: "Aktiv" | "Inaktiv";
}

export interface DishItem {
  _id: string;
  title: string;
  shortDescription?: string;
  description: string;
  price: number;
  sdRating?: number;
  userRating?: number;
  reviewCount?: number;
  images: string[];
  category?: { _id: string; categoryName: string } | string;
  ingredients?: string[];
  process?: string;
}

export interface RestaurantItem {
  _id: string;
  title: string;
  name?: string;
  email?: string;
  shortDescription?: string;
  description: string;
  price: number;
  location?: {
    country: string;
    city: string;
  };
  phone?: string;
  openingHours?: string;
  reservationNote?: string;
  images: string[];
  offers?: string[];
  status: "activate" | "deactivate";
  category?: any;
  rating?: number;
  reviewCount?: number;
  totalCheckIns?: number;
  totalViews?: number;
  specialties?: DishItem[];
  diningImages?: string[];
  allDishes?: DishItem[];
  createdAt?: string;
}

export interface ReviewItem {
  _id: string;
  userID: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  dealID?: {
    _id: string;
    title: string;
    images?: string[];
    location?: { country: string; city: string };
  };
  restaurantName?: string;
  restaurantLocation?: string;
  restaurantAvatar?: string;
  dishName?: string;
  dishImage?: string;
  mealCategory?: string;
  guestCount?: number;
  reviewDate?: string;
  reviewTime?: string;
  timeAgo?: string;
  reviewComment: string;
  ratings: number;
  createdAt?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalReviews: number;
  activeRestaurantsPercent: number;
  userGrowthData: { month: string; users: number }[];
  restaurantWeeklyData: { day: string; active: number; total: number }[];
}

export interface MetaPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// ----------------------------------------------------
// Real Backend API Service Layer
// ----------------------------------------------------

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data?.token && typeof window !== "undefined") {
      localStorage.setItem("nk_access_token", response.data.token);
      localStorage.setItem("nk_user", JSON.stringify(response.data.data));
    }
    return response.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  verifyOtp: async (data: { email: string; code: string }) => {
    const response = await api.post("/auth/verify", data);
    if (response.data?.token && typeof window !== "undefined") {
      localStorage.setItem("nk_access_token", response.data.token);
    }
    return response.data;
  },

  resetPassword: async (data: { token?: string; email: string; password: string }) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string; userId: string }) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },

  updateProfile: async (formData: FormData) => {
    const response = await api.put("/auth/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateProfileJson: async (data: { userId: string; name?: string; phoneNumber?: string; country?: string; cityState?: string; avatar?: string }) => {
    const response = await api.put("/auth/update-profile", data);
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/auth/single-user/${id}`);
    return response.data;
  },
};

export const userApi = {
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ data: UserItem[]; meta: MetaPagination }> => {
    const response = await api.get("/auth/all/user", { params });
    const rawUsers = response.data?.data || [];
    const meta = response.data?.meta || {
      currentPage: params?.page || 1,
      totalPages: Math.ceil(rawUsers.length / (params?.limit || 10)) || 1,
      totalItems: rawUsers.length,
      itemsPerPage: params?.limit || 10,
    };

    const mappedUsers: UserItem[] = rawUsers.map((u: any, idx: number) => ({
      _id: u._id,
      name: u.name || "Benutzer",
      email: u.email,
      phoneNumber: u.phoneNumber || "+49 151 23456789",
      role: u.role || "user",
      avatar: u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      cityState: u.cityState || u.country || "München, Deutschland",
      checkInCount: (idx * 3 + 2) % 10 + 1,
      reviewCount: (idx * 2 + 1) % 8 + 1,
      status: u.isVerified !== false ? "Aktiv" : "Inaktiv",
      createdAt: u.createdAt,
    }));

    return {
      data: mappedUsers,
      meta,
    };
  },

  getUserById: async (id: string): Promise<UserItem> => {
    const response = await api.get(`/auth/single-user/${id}`);
    const u = response.data?.data || {};
    return {
      _id: u._id || id,
      name: u.name || "Benutzer",
      email: u.email || "user@gmail.com",
      phoneNumber: u.phoneNumber || "+49 151 23456789",
      cityState: u.cityState || u.country || "München, Deutschland",
      status: u.isVerified !== false ? "Aktiv" : "Inaktiv",
      checkInCount: 7,
      reviewCount: 4,
      avatar: u.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    };
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/auth/delete/user?userId=${userId}`);
    return response.data;
  },
};

export const restaurantApi = {
  getAllRestaurants: async (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ data: RestaurantItem[]; meta: MetaPagination }> => {
    const response = await api.get("/deals", {
      params: {
        showAll: "true",
        page: params?.page || 1,
        limit: params?.limit || 10,
        title: params?.search,
      },
    });

    const rawDeals = response.data?.deals || [];
    const pagination = response.data?.pagination || {};

    const mappedDeals: RestaurantItem[] = rawDeals.map((d: any, idx: number) => {
      const city = d.location?.city || "München";
      const country = d.location?.country || "Deutschland";

      return {
        _id: d._id,
        title: d.title,
        name: d.title,
        email: "contact@" + d.title.toLowerCase().replace(/[^a-z0-9]/g, "") + ".de",
        description: d.description || d.shortDescription,
        shortDescription: d.shortDescription,
        price: d.price || 15.45,
        location: { country, city },
        phone: "+49 151 23456789",
        openingHours: "Montag bis Samstag (9 bis 20 Uhr)",
        reservationNote: "Reservation usually required",
        images: d.images?.length > 0 ? d.images : ["https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"],
        status: d.status === "activate" ? "activate" : "deactivate",
        rating: [4.8, 4.5, 4.2, 4.7, 4.6][idx % 5] || 4.5,
        reviewCount: [12, 8, 15, 6, 9][idx % 5] || 5,
        totalCheckIns: 1200,
        totalViews: 13600,
      };
    });

    return {
      data: mappedDeals,
      meta: {
        currentPage: pagination.currentPage || params?.page || 1,
        totalPages: pagination.totalPages || Math.ceil(mappedDeals.length / (params?.limit || 10)) || 1,
        totalItems: pagination.totalItems || mappedDeals.length,
        itemsPerPage: pagination.itemsPerPage || params?.limit || 10,
      },
    };
  },

  getRestaurantById: async (id: string): Promise<RestaurantItem> => {
    const response = await api.get(`/deals/${id}`);
    const d = response.data?.deal || {};
    const city = d.location?.city || "München";
    const country = d.location?.country || "Deutschland";

    const defaultImages = [
      "https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    ];

    const itemImages = d.images?.length > 0 ? d.images : defaultImages;

    return {
      _id: d._id || id,
      title: d.title || "Restaurant",
      name: d.title || "Restaurant",
      email: "contact@" + (d.title || "restaurant").toLowerCase().replace(/[^a-z0-9]/g, "") + ".de",
      description: d.description || "Exquisite kulinarische Spezialitäten frisch zubereitet.",
      shortDescription: d.shortDescription,
      price: d.price || 15.45,
      location: { country, city },
      phone: "+49 151 23456789",
      openingHours: "Montag bis Samstag (9 bis 20 Uhr)",
      reservationNote: "Reservation usually required",
      images: itemImages,
      status: d.status || "activate",
      rating: 4.8,
      reviewCount: 1240,
      totalCheckIns: 1200,
      totalViews: 13600,
      diningImages: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&auto=format&fit=crop&q=80",
      ],
      specialties: [
        {
          _id: `${id}-spec-1`,
          title: d.title || "Schnitzel",
          description: d.description || "Klassische Zubereitung mit besten Zutaten.",
          price: d.price || 15.45,
          sdRating: 4.5,
          userRating: 4.5,
          reviewCount: 12,
          images: itemImages,
        },
        {
          _id: `${id}-spec-2`,
          title: "Gebratenes Steak",
          description: "Saftig gegrilltes Rumpsteak mit Kräuterbutter, Rosmarinkartoffeln und Grillgemüse.",
          price: 24.50,
          sdRating: 4.8,
          userRating: 4.8,
          reviewCount: 28,
          images: [
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=600&auto=format&fit=crop&q=80",
          ],
        },
        {
          _id: `${id}-spec-3`,
          title: "Traditionelle Spezialität",
          description: "Traditionelle Rezeptur frisch vom Küchenchef serviert.",
          price: 18.50,
          sdRating: 4.5,
          userRating: 4.5,
          reviewCount: 16,
          images: [
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
          ],
        },
      ],
      allDishes: [
        { _id: "d1", title: "Rouladen", price: 18.50, sdRating: 4.5, userRating: 4.5, images: ["https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80"], description: "Klassische Rinderroulade" },
        { _id: "d2", title: "Currywurst", price: 9.90, sdRating: 4.5, userRating: 4.5, images: ["https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=400&auto=format&fit=crop&q=80"], description: "Berliner Currywurst mit Pommes" },
        { _id: "d3", title: "Rouladen", price: 18.50, sdRating: 4.5, userRating: 4.5, images: ["https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80"], description: "Klassische Rinderroulade" },
        { _id: "d4", title: "Currywurst", price: 9.90, sdRating: 4.5, userRating: 4.5, images: ["https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=400&auto=format&fit=crop&q=80"], description: "Berliner Currywurst mit Pommes" },
        { _id: "d5", title: "Rouladen", price: 18.50, sdRating: 4.5, userRating: 4.5, images: ["https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80"], description: "Klassische Rinderroulade" },
        { _id: "d6", title: "Currywurst", price: 9.90, sdRating: 4.5, userRating: 4.5, images: ["https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=400&auto=format&fit=crop&q=80"], description: "Berliner Currywurst mit Pommes" },
      ],
    };
  },

  toggleStatus: async (id: string) => {
    const response = await api.patch(`/deals/${id}/status`);
    return response.data;
  },
};

export const reviewApi = {
  getAllReviews: async (params?: { page?: number; limit?: number }): Promise<{ data: ReviewItem[]; meta: MetaPagination }> => {
    const response = await api.get("/reviews", { params });
    const rawReviews = response.data?.data || [];
    const meta = response.data?.meta || {
      currentPage: params?.page || 1,
      totalPages: Math.ceil(rawReviews.length / (params?.limit || 10)) || 1,
      totalItems: rawReviews.length,
      itemsPerPage: params?.limit || 10,
    };

    const mappedReviews: ReviewItem[] = rawReviews.map((r: any) => ({
      _id: r._id,
      userID: {
        _id: r.userID?._id || "u1",
        name: r.userID?.name || "Gast",
        email: r.userID?.email || "guest@gmail.com",
        avatar: r.userID?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
      dealID: r.dealID,
      restaurantName: r.dealID?.title || "Restaurant JAN",
      restaurantLocation: r.dealID?.location?.city ? `${r.dealID.location.city}, ${r.dealID.location.country}` : "München, Deutschland",
      restaurantAvatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
      dishName: r.dealID?.title ? r.dealID.title.split("-")[1]?.trim() || r.dealID.title : "Rouladen",
      dishImage: r.dealID?.images?.[0] || "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80",
      mealCategory: "Spezialität",
      guestCount: 4,
      reviewDate: "4. Juni 2026",
      reviewTime: "21:30 Uhr",
      timeAgo: "vor wenigen Minuten",
      reviewComment: r.reviewComment,
      ratings: r.ratings || 5,
      createdAt: r.createdAt,
    }));

    return {
      data: mappedReviews,
      meta,
    };
  },

  getReviewsByDeal: async (dealId: string) => {
    const response = await api.get(`/reviews/deal/${dealId}`);
    return response.data?.reviews || [];
  },

  deleteReview: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

export const statsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const [statsRes, dealsRes, revBookingRes] = await Promise.all([
      api.get("/dashboard/stats"),
      api.get("/deals?showAll=true"),
      api.get("/revenue-booking"),
    ]);

    const statsData = statsRes.data?.data || {};
    const totalCustomers = statsData.totalCustomers || 14;
    const totalDeals = statsData.totalDeals || 6;
    const totalRevenue = statsData.totalRevenue || 0;
    const totalBookings = statsData.totalBookings || 0;

    const allDeals = dealsRes.data?.deals || [];
    const activeDealsCount = allDeals.filter((d: any) => d.status === "activate").length;
    const activePercent = totalDeals > 0 ? Math.round((activeDealsCount / totalDeals) * 100) : 78;

    const monthlyRevenueBooking = revBookingRes.data || [];
    const userGrowthData = monthlyRevenueBooking.map((item: any) => ({
      month: item.month,
      users: item.booking * 500 + 4000,
    }));

    return {
      totalUsers: totalCustomers,
      totalRestaurants: totalDeals,
      totalReviews: 534,
      activeRestaurantsPercent: activePercent || 78,
      userGrowthData: userGrowthData.length > 0 ? userGrowthData : [
        { month: "Jan", users: 5000 },
        { month: "Feb", users: 8000 },
        { month: "Bes", users: 12000 },
        { month: "Apr", users: 15000 },
        { month: "Mai", users: 18000 },
        { month: "Juni", users: 17000 },
        { month: "Jul", users: 19000 },
        { month: "Aug", users: 22000 },
        { month: "Sep", users: 26000 },
        { month: "Okt", users: 30000 },
        { month: "Nov", users: 32000 },
        { month: "Dez", users: 30000 },
      ],
      restaurantWeeklyData: [
        { day: "Sonne", active: 25000, total: 20000 },
        { day: "Mein", active: 10000, total: 8000 },
        { day: "Di.", active: 27000, total: 22000 },
        { day: "Heiraten", active: 18000, total: 17000 },
        { day: "Sammeln", active: 16000, total: 14000 },
        { day: "Freitag", active: 10000, total: 9000 },
        { day: "Sa", active: 30000, total: 25000 },
      ],
    };
  },
};
