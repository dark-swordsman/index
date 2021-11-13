import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { getLibraries } from '../../lib/db/libraries'
import { useSession } from 'next-auth/client'
import { canEdit, isEditor } from '../../lib/session'
import IconEdit from '../../components/icons/IconEdit'
import CollectionBoard from '../../components/boards/CollectionBoard'
import { getByUrlId } from '../../lib/db/db'
import IconLibrary from '../../components/icons/IconLibrary'
import ViewAllButton from '../../components/buttons/ViewAllButton'
import IconNSFW from '../../components/icons/IconNSFW'
import ItemCard from '../../components/cards/ItemCard'
import IconDelete from '../../components/icons/IconDelete'
import { postData } from '../../lib/utils'
import Meta from '../../components/layout/Meta'
import React from 'react'
import { getAllCache } from '../../lib/db/cache'
import { Types } from '../../types/Components'
import useSWR from 'swr'

export default function Library({ library, collections, items }) {
  const [session] = useSession()

  const { data: swrLibrary } = useSWR('/api/library/' + library._id)
  library = swrLibrary || library
  const { data: swrCollections } = useSWR('/api/collections/')
  const collectionsItems = [].concat.apply(
    [],
    library.collections.map((collectionId) => {
      return (swrCollections || collections).find(
        (collection) => collection._id === collectionId
      ).items
    })
  )
  const { data: swrItems } = useSWR('/api/items/')
  items = (swrItems || items).filter((i) =>
    collectionsItems.some((item) => i._id === item)
  )
  const sponsoredItems = items.filter((item) => item.sponsor)

  return (
    <>
      <Head>
        <title>
          {library.name + ' | ' + process.env.NEXT_PUBLIC_SITE_NAME}
        </title>

        <Meta
          title={library.name}
          description={library.description}
          image={process.env.NEXT_PUBLIC_DOMAIN + '/img/' + library.img}
        />
      </Head>

      <div className={'row'} style={{ marginTop: '4rem' }}>
        <div className={'col-auto'}>
          <div className={'d-absolute mb-2'} style={{ marginTop: '-3.2rem' }}>
            <Image
              src={'/img/' + library.img}
              alt={'Image of collection'}
              width={'148px'}
              height={'148px'}
              className={'rounded-circle bg-6'}
            />
          </div>
        </div>
        <div className={'col'}>
          <div className={'row'}>
            <div className={'col'}>
              <h2>
                <IconLibrary /> {library.name}
                {canEdit(session) ? (
                  <Link href={'/edit/library/' + library._id}>
                    <a title={'Edit tab'} className={'ms-2'}>
                      <IconEdit />
                    </a>
                  </Link>
                ) : (
                  <></>
                )}
              </h2>
            </div>
            <div className={'col-12 col-md-auto mb-2'}>
              {library.nsfw && <IconNSFW />}
              {canEdit(session) && (
                <IconDelete
                  className={'ms-2'}
                  title={'Delete library'}
                  onClick={() => {
                    if (
                      confirm(
                        'Do you really want to delete the library "' +
                          library.name +
                          '"?'
                      )
                    ) {
                      postData(
                        '/api/delete/library',
                        { _id: library._id },
                        () => {
                          window.location.href = escape('/libraries')
                        }
                      )
                    }
                  }}
                />
              )}
              <span className={'ms-2'}>
                <ViewAllButton type={'libraries'} />
              </span>
            </div>
          </div>
        </div>
      </div>
      <p
        style={{
          whiteSpace: 'pre-line',
        }}
      >
        {library.description}
      </p>

      <div
        className={'d-flex flex-wrap mb-2'}
        style={{ marginRight: '-0.5rem' }}
      >
        {sponsoredItems.map((item) => {
          return <ItemCard item={item} key={item._id} />
        })}
      </div>

      <CollectionBoard
        _id={library._id}
        collections={library.collections}
        key={library._id}
        canEdit={isEditor(session)}
      />
    </>
  )
}

export async function getStaticPaths() {
  const libraries = await getLibraries()
  const paths = libraries.map((library) => {
    return {
      params: {
        id: library.urlId,
      },
    }
  })

  return {
    paths,
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const library = await getByUrlId('libraries', params.id)
  if (!library) {
    return {
      notFound: true,
      revalidate: 60,
    }
  }

  return {
    props: {
      library,
      collections: await getAllCache(Types.collection),
      items: await getAllCache(Types.item),
    },
    revalidate: 60,
  }
}
