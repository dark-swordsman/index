import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/client'
import { canEdit } from '../../lib/session'
import { getItem, getItems } from '../../lib/db/items'
import DataItem from '../../components/data/DataItem'
import IconEdit from '../../components/icons/IconEdit'
import DataBadge from '../../components/data/DataBadge'
import { splitColumnsIntoTypes } from '../../lib/item'
import useSWR from 'swr'
import IconStar from '../../components/icons/IconStar'
import IconBookmark from '../../components/icons/IconBookmark'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import IconNewTabLink from '../../components/icons/IconNewTabLink'
import { getColumns } from '../../lib/db/columns'
import { getCollections } from '../../lib/db/collections'
import IconItem from '../../components/icons/IconItem'
import OnlineStatus from '../../components/data/OnlineStatus'
import IconNSFW from '../../components/icons/IconNSFW'
import IconSponsor from '../../components/icons/IconSponsor'
import UrlBadge from '../../components/data/UrlBadge'
import IconDelete from '../../components/icons/IconDelete'
import { postData } from '../../lib/utils'

export default function Item({
  _id,
  item: staticItem,
  columns: staticColumns,
  collections: staticCollections,
}) {
  const [session] = useSession()
  let { data: item } = useSWR('/api/item/' + _id)
  let { data: columns } = useSWR('/api/columns')
  let { data: collections } = useSWR('/api/collections')

  item = item || staticItem
  columns = columns || staticColumns
  collections = collections || staticCollections

  const collectionsContainingItem = collections.filter((t) =>
    t.items.includes(_id)
  )
  const column = splitColumnsIntoTypes(
    Object.keys(item.data).map((k) => columns.find((c) => c._id === k)),
    item
  )

  const title = 'Item ' + item.name + ' on ' + process.env.NEXT_PUBLIC_SITE_NAME
  return (
    <>
      <Head>
        <title>{item.name + ' | ' + process.env.NEXT_PUBLIC_SITE_NAME}</title>
        <meta name='twitter:card' content='summary_large_image' />

        <meta property='og:title' content={title} />
        <meta name='twitter:title' content={title} />

        <meta name='description' content={item.description} />
        <meta property='og:description' content={item.description} />
        <meta name='twitter:description' content={item.description} />

        {item.blacklist ? (
          <>
            <meta name='robots' content='noindex, archive, follow' />

            <meta
              name='twitter:image'
              content={
                process.env.NEXT_PUBLIC_DOMAIN + '/blacklisted-screenshot.png'
              }
            />
            <meta
              property='og:image'
              content={
                process.env.NEXT_PUBLIC_DOMAIN + '/blacklisted-screenshot.png'
              }
            />
          </>
        ) : (
          <>
            <meta
              name='twitter:image'
              content={
                process.env.NEXT_PUBLIC_DOMAIN +
                '/api/item/screenshot/' +
                item._id
              }
            />
            <meta
              property='og:image'
              content={
                process.env.NEXT_PUBLIC_DOMAIN +
                '/api/item/screenshot/' +
                item._id
              }
            />
          </>
        )}
      </Head>

      <div className={'row'}>
        <div className={'col-12 col-md-4 col-lg-6 col-xl-4'}>
          <h2>
            <IconItem />{' '}
            {item.blacklist ? (
              <span className={'text-danger'}>
                Blacklisted: <del>{item.name}</del>
              </span>
            ) : (
              item.name
            )}
            <IconNewTabLink url={item.urls[0]} />
            {canEdit(session) && (
              <Link href={'/edit/item/' + item._id}>
                <a title={'Edit item'} className={'ms-2'}>
                  <IconEdit />
                </a>
              </Link>
            )}
            {canEdit(session) && (
              <IconDelete
                className={'ms-2'}
                title={'Delete item'}
                onClick={() => {
                  if (
                    confirm(
                      'Do you really want to delete the item "' +
                        item.name +
                        '"?'
                    )
                  ) {
                    postData('/api/delete/item', { _id: item._id }, () => {
                      window.location.href = escape('/items')
                    })
                  }
                }}
              />
            )}
          </h2>
          <div className={'mb-2'}>
            {collectionsContainingItem.map((t) => {
              return (
                <Link href={'/collection/' + t.urlId} key={t._id}>
                  <a
                    className={'me-2 mb-2'}
                    title={'View collection ' + t.name}
                  >
                    <DataBadge name={t.name} style={'primary'} />
                  </a>
                </Link>
              )
            })}
          </div>

          <div className={'d-flex flex-wrap'}>
            {item.urls.map((url) => (
              <UrlBadge url={url} key={url} />
            ))}
          </div>

          <div>
            <span>
              Status <OnlineStatus url={item.urls[0] ?? ''} />
            </span>
            <small
              className={'text-warning me-2'}
              title={item.stars + ' users have starred this item'}
            >
              {item.stars}
              <FontAwesomeIcon icon={['fas', 'star']} className={'ms-1'} />
            </small>
          </div>

          <p
            style={{
              whiteSpace: 'pre-line',
            }}
          >
            {item.description}
          </p>
        </div>

        <div className={'col-12 col-md-8 col-lg-6 col-xl-8 position-relative'}>
          <div
            className={'position-absolute'}
            style={{
              top: 0,
              right: '0.75rem',
            }}
          >
            <div
              className={'position-relative px-1 pt-1'}
              style={{
                zIndex: 200,
                background: 'rgba(0, 0, 0, 0.5)',
                borderBottomLeftRadius: '0.25rem',
              }}
            >
              {item.sponsor && (
                <span className={'me-2'}>
                  <IconSponsor />
                </span>
              )}
              {item.nsfw && (
                <span className={'me-2'}>
                  <IconNSFW />
                </span>
              )}
              <IconStar item={item} />
              <span className={'ms-2'}>
                <IconBookmark item={item} />
              </span>
            </div>
          </div>
          <Image
            src={'/api/item/screenshot/' + item._id}
            width={'1280px'}
            height={'720px'}
            layout={'responsive'}
            className={'rounded'}
            alt={'Screenshot of the site ' + item.name}
            loader={({ src }) => src}
            unoptimized={true}
          />
          <div className={'text-muted float-end'}>
            Captured screenshot of the site <code>{item.urls[0]}</code>
          </div>
        </div>
      </div>

      {item.blacklist ? (
        <div className={'card bg-2 my-2'}>
          <div className={'card-body'}>
            <p className={'card-text'}>
              This item has been{' '}
              <span className={'text-danger'}>blacklisted</span> due to
              misconduct of their stuff or breaking our rules.
              <br />
              You can apply to be un-
              <span className={'text-danger'}>blacklisted</span> by contacting
              our team on discord.
            </p>
          </div>
        </div>
      ) : (
        <></>
      )}
      {!item.blacklist || canEdit(session) ? (
        <>
          <div className={'card bg-2 my-2'}>
            <div className={'card-body'}>
              <h5 className={'card-title'}>
                It <span className={'text-success'}>does</span> have
              </h5>
              <div className={'d-flex flex-wrap'}>
                {column.yes.length === 0 ? (
                  <span className={'text-muted'}>No data found</span>
                ) : (
                  <></>
                )}
                {column.yes.map((c) => {
                  return (
                    <DataItem data={item.data[c._id]} column={c} key={c._id} />
                  )
                })}
              </div>
            </div>
          </div>
          <div className={'card bg-2 my-2'}>
            <div className={'card-body'}>
              <h5 className={'card-title'}>
                It does <span className={'text-danger'}>not</span> have
              </h5>
              <div className={'d-flex flex-wrap'}>
                {column.no.length === 0 ? (
                  <span className={'text-muted'}>No data found</span>
                ) : (
                  <></>
                )}
                {column.no.map((c) => {
                  return (
                    <DataItem data={item.data[c._id]} column={c} key={c._id} />
                  )
                })}
              </div>
            </div>
          </div>
          <div className={'card bg-2 my-2'}>
            <div className={'card-body'}>
              <h5 className={'card-title'}>Other features are</h5>
              <div className={'d-flex flex-wrap'}>
                {column.array.length === 0 ? (
                  <span className={'text-muted'}>No data found</span>
                ) : (
                  <></>
                )}
                {column.array.map((c) => {
                  return (
                    <div key={c._id}>
                      <Link href={'/column/' + c.urlId}>
                        <a className={'me-2'} title={'View column ' + c.name}>
                          {c.name}:
                        </a>
                      </Link>
                      <DataItem data={item.data[c._id]} column={c} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          {column.text.length > 0 ? (
            column.text.map((c) => (
              <div className={'card bg-2 my-2'} key={c._id}>
                <div className={'card-body'}>
                  <h5 className={'card-title'}>{c.name}</h5>
                  <p className={'card-text'}>{item.data[c._id]}</p>
                </div>
              </div>
            ))
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export async function getStaticPaths() {
  const items = await getItems()
  const paths = items.map((i) => {
    return {
      params: {
        id: i._id,
      },
    }
  })

  return {
    paths,
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const item = await getItem(params.id)
  if (!item) {
    return {
      notFound: true,
      revalidate: 30,
    }
  }

  const columns = await getColumns()
  const collections = await getCollections()

  return {
    props: {
      _id: params.id,
      item,
      columns,
      collections,
    },
    revalidate: 30,
  }
}
