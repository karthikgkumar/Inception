import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const Profile = () => {
  return (
    <DefaultLayout>
      <div className="max-w-screen h-screen overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-black">
            User database
          </h3>
          <p className="text-gray-500 mt-1 max-w-2xl text-sm">
            Details and informations about user.
          </p>
        </div>
        <div className="border-gray-200 border-t">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-black">Full name</dt>
              <div className="mt-1 text-sm text-black sm:col-span-2 sm:mt-0">
                Sushama
              </div>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-black">Address</dt>
              <dd className="mt-1 text-sm text-black sm:col-span-2 sm:mt-0">
                XXXXXXX
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-black">Email address</dt>
              <dd className="mt-1 text-sm text-black sm:col-span-2 sm:mt-0">
                m.poul@example.com
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-black">Phone no:</dt>
              <dd className="mt-1 text-sm text-black sm:col-span-2 sm:mt-0">
                XXXXXXX
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
